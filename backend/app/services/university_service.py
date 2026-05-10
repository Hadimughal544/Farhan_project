from sqlalchemy.orm import Session
from typing import List

from app.models.university import University


class UniversityService:
    @staticmethod
    def add_university(db: Session, data) -> University:
        programs_str = ",".join([p.strip() for p in data.programs])
        if data.max_fee < data.min_fee:
            raise ValueError("max_fee must be greater than or equal to min_fee")
        uni = University(
            name=data.name,
            city=data.city,
            programs=programs_str,
            min_fee=data.min_fee,
            max_fee=data.max_fee,
            merit=data.merit,
            type=data.type,
            tier=data.tier,
            is_scholarships=data.is_scholarships,
            is_admission_open=data.is_admission_open,
        )
        db.add(uni)
        db.commit()
        db.refresh(uni)
        return uni

    @staticmethod
    def list_universities(db: Session) -> List[University]:
        return db.query(University).order_by(University.tier.asc(), University.name.asc()).all()

    @staticmethod
    def update_university(db: Session, university_id: int, data) -> University | None:
        uni = db.query(University).filter(University.id == university_id).first()
        if not uni:
            return None

        payload = data.model_dump(exclude_unset=True)
        if "programs" in payload and payload["programs"] is not None:
            payload["programs"] = ",".join([p.strip() for p in payload["programs"]])

        min_fee = payload.get("min_fee", uni.min_fee)
        max_fee = payload.get("max_fee", uni.max_fee)
        if max_fee < min_fee:
            raise ValueError("max_fee must be greater than or equal to min_fee")

        for key, value in payload.items():
            setattr(uni, key, value)

        db.commit()
        db.refresh(uni)
        return uni

    @staticmethod
    def delete_university(db: Session, university_id: int) -> bool:
        uni = db.query(University).filter(University.id == university_id).first()
        if not uni:
            return False
        db.delete(uni)
        db.commit()
        return True

    @staticmethod
    def suggest_universities(
        db: Session,
        program: str,
        predicted_tier: int,
        utype: str | None,
        prediction: str,
    ):
        """
        Recommend universities matching: program, tier, university type, and admission status.
        Filter only on these 4 criteria; no budget or merit-based filtering.
        """
        prediction = (prediction or "medium").lower()
        
        def collect_for_tier(target_tier: int):
            """Collect universities matching program, tier, and type"""
            candidates = []
            for uni in db.query(University).all():
                # Check admission open
                if not uni.is_admission_open:
                    continue
                
                # Check tier match
                if uni.tier != target_tier:
                    continue
                
                # Check program match
                programs = [p.strip().lower() for p in uni.programs.split(",") if p.strip()]
                if program.lower() not in programs:
                    continue
                
                # Check type match (if specified)
                if utype and uni.type.lower() != utype.lower():
                    continue
                
                candidates.append(uni)
            return candidates
        
        # Try primary tier first
        candidates = collect_for_tier(predicted_tier)
        
        # If no matches, expand to nearby tiers
        if not candidates:
            if predicted_tier > 1:
                candidates.extend(collect_for_tier(predicted_tier - 1))
            if predicted_tier < 3:
                candidates.extend(collect_for_tier(predicted_tier + 1))
        
        # Remove duplicates and sort by tier, then merit
        candidates = list({u.id: u for u in candidates}.values())
        candidates.sort(key=lambda u: (u.tier, -u.merit))
        return candidates

