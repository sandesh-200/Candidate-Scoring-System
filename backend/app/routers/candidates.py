import time
import asyncio

from datetime import datetime, UTC

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request
)

from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from ..dependencies import get_db

from ..services.candidate_ai_service import generate_ai_summary

from ..sse_manager import sse_manager

from ..models import Candidate, Score

from ..schemas import (
    CandidateResponse,
    CandidateDetailResponse,
    CandidateCreate,
    ScoreCreate,
    ScoreResponse
)

from ..auth import (
    get_current_user,
    require_admin
)

from ..services.candidate_service import (
    search_candidates
)

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


# ======================================
# CREATE CANDIDATE
# ======================================

@router.post("")
def create_candidate(
    payload: CandidateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    candidate = Candidate(
        name=payload.name,
        email=payload.email,
        role_applied=payload.role_applied,
        status=payload.status,
        skills=payload.skills,
        internal_notes=payload.internal_notes
    )

    db.add(candidate)

    db.commit()

    db.refresh(candidate)

    return candidate


# ======================================
# LIST CANDIDATES
# ======================================

@router.get(
    "",
    response_model=list[CandidateResponse]
)
def list_candidates(
    status: str = None,
    role_applied: str = None,
    skill: str = None,
    keyword: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):

    offset = (page - 1) * page_size

    candidates = search_candidates(
        db=db,
        status=status,
        role_applied=role_applied,
        skill=skill,
        keyword=keyword,
        offset=offset,
        limit=page_size
    )

    return candidates


# ======================================
# CANDIDATE DETAIL
# ======================================

@router.get(
    "/{candidate_id}",
    response_model=CandidateDetailResponse
)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at.is_(None)
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    # REVIEWER sees only own scores
    if current_user.role != "admin":

        filtered_scores = []

        for score in candidate.scores:

            if score.reviewer_id == current_user.id:
                filtered_scores.append(score)

        candidate.scores = filtered_scores

        candidate.internal_notes = None

    return candidate


# ======================================
# ADD SCORE
# ======================================

@router.post(
    "/{candidate_id}/scores",
    response_model=ScoreResponse
)
def add_score(
    candidate_id: int,
    payload: ScoreCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if payload.score < 1 or payload.score > 5:
        raise HTTPException(
            status_code=400,
            detail="Score must be between 1 and 5"
        )

    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at.is_(None)
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    score = Score(
        candidate_id=candidate.id,
        reviewer_id=current_user.id,
        category=payload.category,
        score=payload.score,
        note=payload.note
    )

    db.add(score)

    db.commit()

    db.refresh(score)

    # Publish SSE event for real-time listeners
    sse_manager.publish(candidate_id, {
        "event": "score_added",
        "score": {
            "id": score.id,
            "category": score.category,
            "score": score.score,
            "note": score.note,
            "reviewer_id": score.reviewer_id,
            "created_at": score.created_at.isoformat(),
        }
    })

    return score


@router.post("/{candidate_id}/summary")
def generate_summary(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    summary = generate_ai_summary(candidate)

    candidate.ai_summary = summary
    db.commit()

    return {
        "message": "Summary generated",
        "summary": summary
    }


# ======================================
# SSE STREAM – REAL-TIME SCORE UPDATES
# ======================================


@router.get("/{candidate_id}/stream")
async def stream_scores(
    candidate_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """SSE endpoint that streams score updates for a candidate in real time."""

    # Verify candidate exists
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at.is_(None)
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    async def event_generator():
        queue = sse_manager.subscribe(candidate_id)
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break

                try:
                    # Wait for a message with a timeout so we can
                    # periodically check for disconnection and send
                    # keep-alive pings.
                    message = await asyncio.wait_for(
                        queue.get(), timeout=30.0
                    )
                    yield f"data: {message}\n\n"
                except asyncio.TimeoutError:
                    # Send a keep-alive comment to prevent connection timeout
                    yield ": keep-alive\n\n"
        finally:
            sse_manager.unsubscribe(candidate_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ======================================
# SOFT DELETE
# ======================================



@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at.is_(None)
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    candidate.deleted_at = datetime.now(UTC)

    db.commit()

    return {
        "message": "Candidate archived"
    }