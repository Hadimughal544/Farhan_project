import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TextInput from "../components/TextInput";
import { predictAdmission } from "../services/predictionService";

export default function PredictionPage() {
  const [form, setForm] = useState({
    matric_pct: "",
    inter_pct: "",
    entry_test_score: "",
    budget: "",
    program: "Computer Science",
    university_tier: 1,
    university_type: "Private",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const programs = [
    "Accounting & Finance",
    "Agriculture",
    "Artificial Intelligence",
    "BBA",
    "Civil Engineering",
    "Computer Engineering",
    "Computer Science",
    "Cyber Security",
    "Data Science",
    "Economics",
    "Electrical Engineering",
    "Food Science",
    "Information Technology",
    "LLB",
    "Marketing",
    "Mechanical Engineering",
    "Media Studies",
    "Psychology",
    "Software Engineering",
  ];
  const universityTypes = ["Government", "Private"];

  const validate = () => {
    const nextErrors = {};

    if (!form.matric_pct || form.matric_pct < 0 || form.matric_pct > 100) {
      nextErrors.matric_pct = "Matric percentage must be between 0-100";
    }
    if (!form.inter_pct || form.inter_pct < 0 || form.inter_pct > 100) {
      nextErrors.inter_pct = "Inter percentage must be between 0-100";
    }
    if (!form.entry_test_score || form.entry_test_score < 0 || form.entry_test_score > 100) {
      nextErrors.entry_test_score = "Entry test score must be between 0-100";
    }
    if (!form.budget || form.budget < 0) {
      nextErrors.budget = "Budget must be a positive number";
    }
    if (!form.program) {
      nextErrors.program = "Please select a program";
    }
    if (!form.university_type) {
      nextErrors.university_type = "Please select university type";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "university_tier") {
        updated.university_tier = parseInt(value);
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const computedEligibility = Number(
        (0.3 * parseFloat(form.matric_pct) +
          0.4 * parseFloat(form.inter_pct) +
          0.3 * parseFloat(form.entry_test_score)).toFixed(2)
      );

      const response = await predictAdmission({
        matric_pct: parseFloat(form.matric_pct),
        inter_pct: parseFloat(form.inter_pct),
        entry_test_score: parseFloat(form.entry_test_score),
        eligibility_score: computedEligibility,
        budget: parseFloat(form.budget),
        program: form.program,
        university_tier: form.university_tier,
        university_type: form.university_type,
      });

      setResult(response);
    } catch (err) {
      setError(err?.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (prediction) => {
    switch (prediction?.toLowerCase()) {
      case "high":
        return "bg-green-100 border-green-300 text-green-800";
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "low":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Admission Prediction
            </h1>
            <p className="text-slate-600">
              Enter your academic details to get your admission chances
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Enter Your Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Matric Percentage */}
                <TextInput
                  name="matric_pct"
                  label="Matric Percentage (%)"
                  type="number"
                  placeholder="Enter matric percentage"
                  value={form.matric_pct}
                  onChange={onChange}
                  error={errors.matric_pct}
                  step="0.01"
                  min="0"
                  max="100"
                />

                {/* Inter Percentage */}
                <TextInput
                  name="inter_pct"
                  label="Inter Percentage (%)"
                  type="number"
                  placeholder="Enter intermediate percentage"
                  value={form.inter_pct}
                  onChange={onChange}
                  error={errors.inter_pct}
                  step="0.01"
                  min="0"
                  max="100"
                />

                {/* Entry Test Score */}
                <TextInput
                  name="entry_test_score"
                  label="Entry Test Score (%)"
                  type="number"
                  placeholder="Enter entry test score"
                  value={form.entry_test_score}
                  onChange={onChange}
                  error={errors.entry_test_score}
                  step="0.01"
                  min="0"
                  max="100"
                />

                {/* Budget */}
                <TextInput
                  name="budget"
                  label="Budget (PKR)"
                  type="number"
                  placeholder="Enter your budget"
                  value={form.budget}
                  onChange={onChange}
                  error={errors.budget}
                  step="1000"
                  min="0"
                />

                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Program
                  </label>
                  <select
                    name="program"
                    value={form.program}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {programs.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                  {errors.program && (
                    <p className="text-red-500 text-sm mt-1">{errors.program}</p>
                  )}
                </div>

                {/* University Tier */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    University Tier
                  </label>
                  <select
                    name="university_tier"
                    value={form.university_tier}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Tier 1 (Top)</option>
                    <option value={2}>Tier 2 (Mid)</option>
                    <option value={3}>Tier 3 (Emerging)</option>
                  </select>
                </div>

                {/* University Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    University Type
                  </label>
                  <select
                    name="university_type"
                    value={form.university_type}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {universityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.university_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.university_type}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 mt-6"
                >
                  {loading ? "Predicting..." : "Get Prediction"}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Results Section */}
            <div>
              {result ? (
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                    Prediction Result
                  </h2>

                  {/* Prediction Badge */}
                  <div className={`p-6 rounded-lg border-2 mb-6 ${getPredictionColor(result.prediction)}`}>
                    <div className="text-sm font-medium opacity-75 mb-1">
                      Admission chance (model)
                    </div>
                    <div className="text-3xl font-bold capitalize">
                      {result.prediction}
                    </div>
                    {result.chance_percent != null ? (
                      <div className="mt-3 text-2xl font-semibold tabular-nums">
                        {Number(result.chance_percent).toFixed(1)}%
                        <span className="ml-2 text-base font-normal opacity-90">for this band</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Per-class chances */}
                  {result.chance_breakdown && Object.keys(result.chance_breakdown).length > 0 ? (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-700 mb-3">
                        Estimated probability by outcome
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const order = ["High", "Medium", "Low"];
                          const entries = Object.entries(result.chance_breakdown);
                          const ordered = [
                            ...order.filter((k) => k in result.chance_breakdown).map((k) => [k, result.chance_breakdown[k]]),
                            ...entries.filter(([k]) => !order.includes(k)),
                          ];
                          return ordered.map(([band, pct]) => {
                            if (pct == null) return null;
                            const color =
                              String(band).toLowerCase() === "high"
                                ? "bg-emerald-500"
                                : String(band).toLowerCase() === "medium"
                                  ? "bg-amber-500"
                                  : String(band).toLowerCase() === "low"
                                    ? "bg-rose-500"
                                    : "bg-slate-500";
                            return (
                              <div key={band}>
                                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                  <span>{band}</span>
                                  <span className="tabular-nums">{Number(pct).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all ${color}`}
                                    style={{ width: `${Math.min(100, Number(pct))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Percentages come from the trained model (all classes sum to 100%).
                      </p>
                    </div>
                  ) : null}

                  {/* Legacy confidence (max class probability) */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-slate-600 mb-2">
                      Model confidence (max probability)
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((result.confidence ?? 0) * 100).toFixed(1)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {((result.confidence ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {result.predicted_tier != null ? (
                    <p className="mb-6 text-sm text-slate-600">
                      Recommendations use <strong>Tier {result.predicted_tier}</strong> universities aligned with
                      this prediction, plus your program, budget, merit, and institution type.
                    </p>
                  ) : null}

                  {/* Input Summary */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Your Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Matric:</span>
                        <span className="font-medium">
                          {result.input_data.matric_pct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Intermediate:</span>
                        <span className="font-medium">
                          {result.input_data.inter_pct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Entry Test:</span>
                        <span className="font-medium">
                          {result.input_data.entry_test_score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Eligibility:</span>
                        <span className="font-medium">
                          {result.input_data.eligibility_score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Budget:</span>
                        <span className="font-medium">
                          PKR {result.input_data.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Program:</span>
                        <span className="font-medium">
                          {result.input_data.program}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">University Tier:</span>
                        <span className="font-medium">
                          Tier {result.input_data.university_tier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">University Type:</span>
                        <span className="font-medium">
                          {result.input_data.university_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Suggested Universities */}
                  {result.suggested_universities && result.suggested_universities.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="font-semibold text-slate-900 mb-1">Recommended universities</h3>
                      <p className="mb-3 text-xs text-slate-500">
                        Shortlisted from your catalog (max 8): same tier as your prediction when possible, matching
                        program and type, affordable on your budget, and open for admission.
                      </p>
                      <div className="grid gap-3">
                        {result.suggested_universities.map((u) => (
                          <div key={u.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-slate-800">{u.name}</div>
                                <div className="text-sm text-slate-600">{u.programs.join(", ")}</div>
                              </div>
                              <div className="text-sm text-slate-600 text-right">
                                <div>Tier {u.tier}</div>
                                <div>{u.type}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-slate-700">
                              <div>City: {u.city}</div>
                              <div>
                                Fee Range: PKR {Number(u.min_fee).toLocaleString()} -{" "}
                                {Number(u.max_fee).toLocaleString()}
                              </div>
                              <div>Merit: {u.merit}</div>
                              <div>Scholarships: {u.is_scholarships ? "Yes" : "No"}</div>
                              <div>Admission Open: {u.is_admission_open ? "Yes" : "No"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      No universities in the database matched this prediction and your details. Admins can add
                      matching programs, tiers, and fee bands under Admin → Universities.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className="text-slate-400 mb-2">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600">
                      Fill the form and click "Get Prediction" to see results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
