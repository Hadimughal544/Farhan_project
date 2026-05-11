from app.schemas.advanced import (
    CareerRecommendationRequest,
    RoadmapRequest,
    ScholarshipRecommendationRequest,
)


class AdvancedAdvisorService:
    @staticmethod
    def scholarship_recommendations(payload: ScholarshipRecommendationRequest) -> list[dict]:
        items = []
        marks = payload.marks
        income = payload.income_range.strip().lower()
        degree = payload.degree_preference.strip()

        if marks >= 85:
            items.append(
                {
                    "title": "Merit Excellence Scholarship",
                    "category": "merit",
                    "reason": f"Your academic score of {marks:.1f}% qualifies for high-merit scholarships in {degree}.",
                }
            )

        if any(key in income for key in ["low", "under", "below", "50000", "60000"]):
            items.append(
                {
                    "title": "Need-Based Tuition Support",
                    "category": "need-based",
                    "reason": "Your declared income range indicates eligibility for need-based aid and fee waivers.",
                }
            )

        if payload.city.strip():
            items.append(
                {
                    "title": "Provincial / Government Assistance",
                    "category": "government",
                    "reason": f"Apply for regional scholarship quotas and government aid programs in {payload.city.strip()}.",
                }
            )

        items.append(
            {
                "title": "University Financial Aid",
                "category": "financial-aid",
                "reason": "Most partner universities provide semester-based aid for performance and financial need.",
            }
        )

        return items

    @staticmethod
    def career_recommendation(payload: CareerRecommendationRequest) -> dict:
        interests = {k.lower(): int(v) for k, v in payload.interests.items()} if payload.interests else {}
        skills = {k.lower(): int(v) for k, v in payload.skills.items()} if payload.skills else {}

        domain_weights = {
            "artificial intelligence": interests.get("ai", 0) + interests.get("data science", 0) + skills.get("python", 0),
            "cyber security": interests.get("cyber security", 0) + skills.get("networking", 0) + skills.get("linux", 0),
            "software engineering": interests.get("software engineering", 0) + skills.get("problem solving", 0),
            "computer science": interests.get("computer science", 0) + skills.get("math", 0),
            "business analytics": interests.get("business analytics", 0) + skills.get("communication", 0),
        }

        best_degree = max(domain_weights.items(), key=lambda x: x[1])[0] if domain_weights else "computer science"

        recommendations = {
            "artificial intelligence": {
                "future_scope": "High demand in automation, intelligent products, and applied research.",
                "expected_salary_pkr": "120,000 - 350,000 per month",
                "required_skills": ["Python", "ML", "Statistics", "Data Engineering"],
            },
            "cyber security": {
                "future_scope": "Strong hiring in banking, telecom, defense, and compliance sectors.",
                "expected_salary_pkr": "100,000 - 300,000 per month",
                "required_skills": ["Networking", "Linux", "SIEM", "Threat Analysis"],
            },
            "software engineering": {
                "future_scope": "Consistent demand across product companies and software houses.",
                "expected_salary_pkr": "90,000 - 280,000 per month",
                "required_skills": ["DSA", "Web Development", "System Design", "Testing"],
            },
            "computer science": {
                "future_scope": "Broad pathway into software, data, AI, and systems engineering.",
                "expected_salary_pkr": "85,000 - 250,000 per month",
                "required_skills": ["Programming", "Algorithms", "Databases", "OS Basics"],
            },
            "business analytics": {
                "future_scope": "Growing opportunities in fintech, consulting, and enterprise analytics.",
                "expected_salary_pkr": "80,000 - 220,000 per month",
                "required_skills": ["SQL", "Data Visualization", "Excel", "Communication"],
            },
        }

        selected = recommendations.get(best_degree, recommendations["computer science"])
        return {
            "best_degree": best_degree.title(),
            "future_scope": selected["future_scope"],
            "expected_salary_pkr": selected["expected_salary_pkr"],
            "required_skills": selected["required_skills"],
        }

    @staticmethod
    def roadmap(payload: RoadmapRequest) -> dict:
        degree = payload.degree.strip().title()
        sem = payload.current_semester

        semester_roadmap = [
            f"Semester {sem}: strengthen fundamentals and complete 1 capstone mini-project.",
            f"Semester {min(8, sem + 1)}: focus on advanced electives and portfolio quality.",
            f"Semester {min(8, sem + 2)}: target internships and interview preparation.",
        ]

        return {
            "degree": degree,
            "semester_roadmap": semester_roadmap,
            "skills_roadmap": [
                "Master data structures and problem solving",
                "Build 2 production-level projects",
                "Improve technical communication and documentation",
            ],
            "certifications": [
                "Google Data Analytics / equivalent",
                "AWS Cloud Practitioner",
                "Foundations of Cybersecurity or ML specialization",
            ],
            "internship_guidance": [
                "Apply to startups and university incubators early",
                "Customize resume by domain and project impact",
                "Track deadlines weekly and follow up professionally",
            ],
        }
