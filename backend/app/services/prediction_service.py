import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path


class PredictionService:
    _model = None
    _feature_columns = None
    _program_encoder = None
    _type_encoder = None
    _chance_encoder = None
    _initialized = False

    @classmethod
    def initialize(cls):
        """Initialize the model and encoders from joblib files."""
        if cls._initialized:
            return

        model_dir = Path(__file__).parent.parent.parent / "ml" / "models"

        try:
            # Try loading with joblib first (recommended for sklearn)
            # If files are .pkl, joblib can read them
            try:
                cls._model = joblib.load(model_dir / "admission_model.pkl")
            except Exception as e:
                print(f"Joblib load failed, trying alternative: {str(e)}")
                # Fallback: try with pickle protocol 2 compatibility
                import pickle
                with open(model_dir / "admission_model.pkl", "rb") as f:
                    cls._model = pickle.load(f, encoding='latin1')

            # Load encoders with joblib
            cls._feature_columns = joblib.load(model_dir / "feature_columns.pkl")
            cls._program_encoder = joblib.load(model_dir / "program_encoder.pkl")
            cls._type_encoder = joblib.load(model_dir / "type_encoder.pkl")
            cls._chance_encoder = joblib.load(model_dir / "chance_encoder.pkl")

            cls._initialized = True
        except Exception as e:
            raise RuntimeError(f"Failed to initialize prediction service: {str(e)}")

    @classmethod
    def predict(cls, request_data: dict) -> dict:
        """
        Make a prediction based on student data.

        Args:
            request_data: Dictionary containing student details

        Returns:
            Dictionary with prediction and confidence
        """
        if not cls._initialized:
            cls.initialize()

        try:
            # Extract numeric features
            matric = float(request_data["matric_pct"])
            inter = float(request_data["inter_pct"])
            entry_test = float(request_data["entry_test_score"])

            # Compute eligibility score if not provided (weighted average)
            # Weights: matric 30%, entry test 30%, inter 40%
            eligibility = request_data.get("eligibility_score")
            if eligibility is not None:
                try:
                    eligibility = float(eligibility)
                except (TypeError, ValueError):
                    eligibility = None

            if eligibility is None or np.isnan(eligibility):
                eligibility = round((0.30 * matric) + (0.30 * entry_test) + (0.40 * inter), 2)

            numeric_features = {
                "matric_pct": matric,
                "inter_pct": inter,
                "entry_test_score": entry_test,
                "eligibility_score": float(eligibility),
                "budget": float(request_data["budget"]),
                "university_tier": int(request_data["university_tier"]),
            }

            # Encode categorical features
            program = request_data["program"]
            university_type = request_data["university_type"]

            try:
                program_encoded = cls._program_encoder.transform([program])[0]
            except ValueError:
                raise ValueError(f"Unsupported program: {program}")

            try:
                type_encoded = cls._type_encoder.transform([university_type])[0]
            except ValueError:
                raise ValueError(f"Unsupported university_type: {university_type}")

            # Create feature vector in the exact training column order.
            feature_values = {
                "matric_pct": numeric_features["matric_pct"],
                "inter_pct": numeric_features["inter_pct"],
                "entry_test_score": numeric_features["entry_test_score"],
                "eligibility_score": numeric_features["eligibility_score"],
                "budget": numeric_features["budget"],
                "program": float(program_encoded),
                "university_tier": numeric_features["university_tier"],
                "university_type": float(type_encoded),
            }
            features = pd.DataFrame(
                [{column: feature_values[column] for column in cls._feature_columns}],
                columns=cls._feature_columns,
            )

            # Make prediction
            prediction = cls._model.predict(features)[0]
            probabilities = cls._model.predict_proba(features)[0]

            # Decode prediction
            prediction_label = cls._chance_encoder.inverse_transform([prediction])[0]
            prediction_label = str(prediction_label).strip()

            # Per-class probabilities as percentages (aligned with model.classes_)
            chance_breakdown: dict[str, float] = {}
            for idx, class_val in enumerate(cls._model.classes_):
                cls_arr = np.array([class_val])
                label = cls._chance_encoder.inverse_transform(cls_arr)[0]
                key = str(label).strip()
                chance_breakdown[key] = round(float(probabilities[idx]) * 100.0, 2)

            # Stable display order: High, Medium, Low (omit missing keys)
            display_order = ["High", "Medium", "Low"]
            ordered_breakdown = {k: chance_breakdown[k] for k in display_order if k in chance_breakdown}
            for k, v in chance_breakdown.items():
                if k not in ordered_breakdown:
                    ordered_breakdown[k] = v

            chance_percent = float(ordered_breakdown.get(prediction_label, float(np.max(probabilities)) * 100.0))
            confidence = float(np.max(probabilities))

            return {
                "prediction": prediction_label,
                "confidence": confidence,
                "chance_percent": round(chance_percent, 2),
                "chance_breakdown": ordered_breakdown,
                "input_data": {
                    "matric_pct": numeric_features["matric_pct"],
                    "inter_pct": numeric_features["inter_pct"],
                    "entry_test_score": numeric_features["entry_test_score"],
                    "eligibility_score": numeric_features["eligibility_score"],
                    "budget": numeric_features["budget"],
                    "program": program,
                    "university_tier": numeric_features["university_tier"],
                    "university_type": university_type,
                },
            }

        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")
