from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    func,
    Index
)

from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="reviewer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scores = relationship("Score", back_populates="reviewer")



class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role_applied = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="new", index=True)
    skills = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    scores = relationship(
        "Score",
        back_populates="candidate",
        cascade="all, delete-orphan"
    )


class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False,
        index=True
    )
    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    category = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    candidate = relationship("Candidate", back_populates="scores")
    reviewer = relationship("User", back_populates="scores")


Index("idx_candidate_status_role", Candidate.status, Candidate.role_applied)