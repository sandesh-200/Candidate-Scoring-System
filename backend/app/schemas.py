from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime



class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str



class ScoreCreate(BaseModel):
    category: str
    score: int
    note: Optional[str] = None


class ScoreResponse(BaseModel):
    id: int
    category: str
    score: int
    note: Optional[str]
    reviewer_id: int
    created_at: datetime

    model_config = {
    "from_attributes": True
        }


class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    role_applied: str
    status: str = "new"
    skills: Optional[str] = None
    internal_notes: Optional[str] = None


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    role_applied: str
    status: str
    skills: Optional[str]

    model_config = {
    "from_attributes": True
}


class CandidateDetailResponse(BaseModel):
    id: int
    name: str
    email: str
    role_applied: str
    status: str
    skills: Optional[str]
    internal_notes: Optional[str]
    created_at: datetime
    scores: List[ScoreResponse]
    ai_summary: Optional[str] = None

    model_config = {
    "from_attributes": True
}


class CandidateSummaryData(BaseModel):
    overview: str
    strengths: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    recommended_next_step: Optional[str] = None
    confidence: Optional[str] = None


class CandidateSummaryResponse(BaseModel):
    message: str
    summary: str
    data: Optional[CandidateSummaryData] = None
    provider: str
    model: Optional[str] = None
