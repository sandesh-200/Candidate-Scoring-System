from .database import SessionLocal
from .models import User, Candidate
from .auth import hash_password


db = SessionLocal()


def seed_users():

    existing_admin = db.query(User).filter(
        User.email == "admin@techkraft.com"
    ).first()

    if not existing_admin:

        admin = User(
            email="admin@techkraft.com",
            password_hash=hash_password("admin123"),
            role="admin"
        )

        db.add(admin)

    existing_reviewer = db.query(User).filter(
        User.email == "reviewer@techkraft.com"
    ).first()

    if not existing_reviewer:

        reviewer = User(
            email="reviewer@techkraft.com",
            password_hash=hash_password("reviewer123"),
            role="reviewer"
        )

        db.add(reviewer)

    db.commit()


def seed_candidates():

    existing = db.query(Candidate).first()

    if existing:
        return

    candidates = [

        Candidate(
            name="Alice Johnson",
            email="alice@example.com",
            role_applied="Frontend Engineer",
            status="new",
            skills="React, TypeScript, Tailwind",
            internal_notes="Strong UI portfolio"
        ),

        Candidate(
            name="Bob Smith",
            email="bob@example.com",
            role_applied="Backend Engineer",
            status="reviewed",
            skills="Python, FastAPI, PostgreSQL",
            internal_notes="Excellent API design"
        ),

        Candidate(
            name="Charlie Brown",
            email="charlie@example.com",
            role_applied="Full Stack Engineer",
            status="hired",
            skills="React, Node.js, Docker",
            internal_notes="Great communication"
        ),

        Candidate(
            name="Diana Prince",
            email="diana@example.com",
            role_applied="DevOps Engineer",
            status="rejected",
            skills="AWS, Terraform, Kubernetes",
            internal_notes="Weak debugging skills"
        )
    ]

    db.add_all(candidates)

    db.commit()


if __name__ == "__main__":

    seed_users()

    seed_candidates()

    print("Database seeded successfully")