from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Candidate


def search_candidates(
    db: Session,
    status: str = None,
    role_applied: str = None,
    skill: str = None,
    keyword: str = None,
    offset: int = 0,
    limit: int = 20
):

    query = db.query(Candidate).filter(
        Candidate.deleted_at.is_(None)
    )

    if status:
        query = query.filter(
            Candidate.status == status
        )

    if role_applied:
        query = query.filter(
            Candidate.role_applied == role_applied
        )

    if skill:
        query = query.filter(
            Candidate.skills.ilike(f"%{skill}%")
        )

    if keyword:
        query = query.filter(
            or_(
                Candidate.name.ilike(f"%{keyword}%"),
                Candidate.email.ilike(f"%{keyword}%")
            )
        )

    return query.offset(offset).limit(limit).all()