"""
main.py – ARAV AI FastAPI application.
All API endpoints, CORS, rate limiting and startup initialization.
"""
from __future__ import annotations
import os
import uuid
import random
import string
import logging
from datetime import datetime, timezone
from typing import List, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import (
    Depends, FastAPI, File, Form, HTTPException,
    Query, Request, UploadFile, status,
)
from fastapi.responses import JSONResponse, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

import models
import schemas
import auth as auth_mod
import gemini as gemini_mod
import knowledge as knowledge_mod
import voice as voice_mod
from database import engine, get_db, Base

# ── Logging ─────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("arav_ai")

# ── Create tables ────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Rate limiter ─────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── App ──────────────────────────────────────
app = FastAPI(
    title="ARAV AI API",
    description="Multilingual Cooperative Governance & Legal Assistance Chatbot – Smart India Hackathon 26088",
    version="1.0.0",
)
app.state.limiter = limiter

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Startup ──────────────────────────────────
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        knowledge_mod.seed_knowledge(db)
        logger.info("ARAV AI backend started. Knowledge base ready.")
    finally:
        db.close()


# ── Helpers ───────────────────────────────────
def generate_ref(prefix: str = "ARAV") -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{prefix}-{suffix}"


# ════════════════════════════════════════════════
# HEALTH & ROOT
# ════════════════════════════════════════════════
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": "ARAV AI API",
        "version": "1.0.0",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Returns service status and Gemini model info."""
    db_ok = True
    try:
        db.execute(models.User.__table__.select().limit(1))
    except Exception:
        db_ok = False

    return {
        "status": "ok",
        "service": "ARAV AI",
        "version": "1.0.0",
        "database": "connected" if db_ok else "error",
        "gemini_model": "gemini-3.5-flash-lite",
        "stt_provider": "gemini-multimodal",
        "tts_provider": os.getenv("TTS_PROVIDER", "none"),
    }


# ════════════════════════════════════════════════
# AUTH
# ════════════════════════════════════════════════
@app.post("/auth/register", response_model=schemas.TokenResponse, tags=["Auth"])
@limiter.limit("10/minute")
def register(
    request: Request,
    payload: schemas.RegisterRequest,
    db: Session = Depends(get_db),
):
    # Check duplicate mobile
    if db.query(models.User).filter(models.User.mobile_number == payload.mobile_number).first():
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    # Check duplicate email
    if payload.email and db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name=payload.full_name,
        mobile_number=payload.mobile_number,
        email=payload.email,
        hashed_password=auth_mod.hash_password(payload.password),
        state=payload.state,
        district=payload.district,
        preferred_language=payload.preferred_language,
        cooperative_society=payload.cooperative_society,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth_mod.create_access_token(user.id)
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@app.post("/auth/login", response_model=schemas.TokenResponse, tags=["Auth"])
@limiter.limit("10/minute")
def login(
    request: Request,
    payload: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.mobile_number == payload.mobile_number).first()
    if not user or not auth_mod.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid mobile number or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = auth_mod.create_access_token(user.id)
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@app.get("/users/me", response_model=schemas.UserResponse, tags=["Users"])
def get_me(current_user: models.User = Depends(auth_mod.get_current_user)):
    return schemas.UserResponse.model_validate(current_user)


@app.patch("/users/me", response_model=schemas.UserResponse, tags=["Users"])
def update_me(
    payload: schemas.UpdateUserRequest,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.email is not None:
        existing = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email
    if payload.state is not None:
        current_user.state = payload.state
    if payload.district is not None:
        current_user.district = payload.district
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.cooperative_society is not None:
        current_user.cooperative_society = payload.cooperative_society

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return schemas.UserResponse.model_validate(current_user)


# ════════════════════════════════════════════════
# CHAT
# ════════════════════════════════════════════════
@app.post("/chat", response_model=schemas.ChatResponse, tags=["Chat"])
@limiter.limit("30/minute")
async def chat(
    request: Request,
    payload: schemas.ChatRequest,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    # Get or create conversation
    conversation: Optional[models.ChatConversation] = None
    if payload.conversation_id:
        conversation = db.query(models.ChatConversation).filter(
            models.ChatConversation.id == payload.conversation_id,
            models.ChatConversation.user_id == current_user.id,
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation:
        conversation = models.ChatConversation(
            user_id=current_user.id,
            language=payload.language,
            title=payload.message[:80] if len(payload.message) > 0 else "New Conversation",
        )
        db.add(conversation)
        db.flush()

    # Retrieve knowledge context
    sources = knowledge_mod.retrieve_relevant_sources(db, payload.message, payload.language, top_k=3)
    knowledge_context = ""
    if sources:
        context_parts = []
        for s in sources:
            context_parts.append(f"[{s.title}]\n{s.content}\nSource: {s.source_url or 'Internal knowledge base'}")
        knowledge_context = "\n\n---\n\n".join(context_parts)

    # Build conversation history
    history_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in conversation.messages
    ]

    # Generate Gemini response
    try:
        ai_text = await gemini_mod.generate_response(
            user_message=payload.message,
            language=payload.language,
            conversation_history=history_messages,
            knowledge_context=knowledge_context,
        )
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        raise HTTPException(status_code=503, detail=f"AI service temporarily unavailable: {str(e)}")

    # Save user message
    user_msg = models.ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
        language=payload.language,
    )
    db.add(user_msg)

    # Build source citations
    source_citations = [
        schemas.SourceCitation(
            title=s.title,
            url=s.source_url,
            category=s.category,
        )
        for s in sources
    ]

    # Save assistant message
    assistant_msg = models.ChatMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_text,
        sources=[sc.model_dump() for sc in source_citations],
        language=payload.language,
    )
    db.add(assistant_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_msg)

    return schemas.ChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_msg.id,
        content=ai_text,
        sources=source_citations,
        language=payload.language,
        created_at=assistant_msg.created_at,
    )


@app.get("/chat/history", response_model=List[schemas.ConversationOut], tags=["Chat"])
def get_chat_history(
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    convs = (
        db.query(models.ChatConversation)
        .filter(models.ChatConversation.user_id == current_user.id)
        .order_by(models.ChatConversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for c in convs:
        result.append(
            schemas.ConversationOut(
                id=c.id,
                title=c.title,
                language=c.language,
                message_count=len(c.messages),
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
        )
    return result


@app.get("/chat/conversations/{conversation_id}", response_model=schemas.ConversationDetailOut, tags=["Chat"])
def get_conversation(
    conversation_id: str,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(models.ChatConversation).filter(
        models.ChatConversation.id == conversation_id,
        models.ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = [
        schemas.MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            sources=[schemas.SourceCitation(**s) for s in (m.sources or [])],
            language=m.language,
            created_at=m.created_at,
        )
        for m in conv.messages
    ]
    return schemas.ConversationDetailOut(
        id=conv.id,
        title=conv.title,
        language=conv.language,
        messages=messages,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


@app.delete("/chat/conversations/{conversation_id}", tags=["Chat"])
def delete_conversation(
    conversation_id: str,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(models.ChatConversation).filter(
        models.ChatConversation.id == conversation_id,
        models.ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}


# ════════════════════════════════════════════════
# VOICE
# ════════════════════════════════════════════════
@app.post("/voice/transcribe", response_model=schemas.TranscribeResponse, tags=["Voice"])
@limiter.limit("20/minute")
async def transcribe(
    request: Request,
    audio: UploadFile = File(...),
    language: str = Form("en"),
    current_user: models.User = Depends(auth_mod.get_current_user),
):
    audio_bytes = await audio.read()
    if len(audio_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Audio file too large (max 10MB)")

    try:
        transcript, confidence = await voice_mod.transcribe_audio(
            audio_bytes, language, audio.content_type or "audio/webm"
        )
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Transcription error: {str(e)}")

    return schemas.TranscribeResponse(
        transcript=transcript,
        language=language,
        confidence=confidence,
    )


@app.post("/voice/synthesize", tags=["Voice"])
@limiter.limit("20/minute")
async def synthesize(
    request: Request,
    payload: schemas.SynthesizeRequest,
    current_user: models.User = Depends(auth_mod.get_current_user),
):
    try:
        audio_bytes = await voice_mod.synthesize_speech(payload.text, payload.language)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Synthesis error: {str(e)}")

    if audio_bytes is None:
        raise HTTPException(
            status_code=501,
            detail="Text-to-speech is not configured. Configure TTS_PROVIDER in backend/.env."
        )

    return Response(content=audio_bytes, media_type="audio/mpeg")


# ════════════════════════════════════════════════
# SCHEMES
# ════════════════════════════════════════════════
@app.get("/schemes", response_model=List[schemas.SchemeOut], tags=["Schemes"])
def list_schemes(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(models.Scheme).filter(models.Scheme.is_active == True)
    if category:
        q = q.filter(models.Scheme.category == category)
    if state:
        q = q.filter(
            (models.Scheme.applicable_state == state) | (models.Scheme.applicable_state == None)
        )
    if search:
        q = q.filter(models.Scheme.name.ilike(f"%{search}%"))
    return q.offset(skip).limit(limit).all()


@app.get("/schemes/{scheme_id}", response_model=schemas.SchemeOut, tags=["Schemes"])
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(models.Scheme).filter(models.Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


# ════════════════════════════════════════════════
# SOCIETIES
# ════════════════════════════════════════════════
@app.get("/societies", response_model=List[schemas.SocietyOut], tags=["Societies"])
def list_societies(
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(models.Society)
    if district:
        q = q.filter(models.Society.district.ilike(f"%{district}%"))
    if state:
        q = q.filter(models.Society.state.ilike(f"%{state}%"))
    if search:
        q = q.filter(models.Society.name.ilike(f"%{search}%"))
    return q.offset(skip).limit(limit).all()


@app.get("/societies/{society_id}", response_model=schemas.SocietyOut, tags=["Societies"])
def get_society(society_id: str, db: Session = Depends(get_db)):
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    return society


# ════════════════════════════════════════════════
# APPLICATIONS
# ════════════════════════════════════════════════
@app.post("/applications", response_model=schemas.ApplicationOut, tags=["Applications"])
def create_application(
    payload: schemas.ApplicationCreate,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    ref = generate_ref("APP")
    application = models.Application(
        reference_number=ref,
        user_id=current_user.id,
        application_type=payload.application_type,
        title=payload.title,
        status="submitted",
        form_data=payload.form_data,
    )
    db.add(application)
    db.flush()

    history = models.ApplicationStatusHistory(
        application_id=application.id,
        status="submitted",
        notes="Application submitted",
        changed_by="system",
    )
    db.add(history)
    db.commit()
    db.refresh(application)

    # Send notification
    notif = models.Notification(
        user_id=current_user.id,
        title="Application Submitted",
        body=f"Your application '{payload.title}' has been submitted. Reference: {ref}",
        notification_type="application",
        related_id=application.id,
    )
    db.add(notif)
    db.commit()

    return schemas.ApplicationOut(
        id=application.id,
        reference_number=application.reference_number,
        application_type=application.application_type,
        title=application.title,
        status=application.status,
        form_data=application.form_data,
        submitted_at=application.submitted_at,
        history=[schemas.StatusHistoryOut.model_validate(h) for h in application.history],
    )


@app.get("/applications", response_model=List[schemas.ApplicationOut], tags=["Applications"])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Application).filter(models.Application.user_id == current_user.id)
    if status_filter:
        q = q.filter(models.Application.status == status_filter)
    apps = q.order_by(models.Application.submitted_at.desc()).all()

    result = []
    for a in apps:
        result.append(schemas.ApplicationOut(
            id=a.id,
            reference_number=a.reference_number,
            application_type=a.application_type,
            title=a.title,
            status=a.status,
            form_data=a.form_data,
            submitted_at=a.submitted_at,
            history=[schemas.StatusHistoryOut.model_validate(h) for h in a.history],
        ))
    return result


@app.get("/applications/{application_id}", response_model=schemas.ApplicationOut, tags=["Applications"])
def get_application(
    application_id: str,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return schemas.ApplicationOut(
        id=app.id,
        reference_number=app.reference_number,
        application_type=app.application_type,
        title=app.title,
        status=app.status,
        form_data=app.form_data,
        submitted_at=app.submitted_at,
        history=[schemas.StatusHistoryOut.model_validate(h) for h in app.history],
    )


# ════════════════════════════════════════════════
# DOCUMENTS
# ════════════════════════════════════════════════
@app.get("/documents", response_model=List[schemas.DocumentRequestOut], tags=["Documents"])
def list_documents(
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    requests = (
        db.query(models.DocumentRequest)
        .filter(models.DocumentRequest.user_id == current_user.id)
        .order_by(models.DocumentRequest.requested_at.desc())
        .all()
    )
    return [schemas.DocumentRequestOut.model_validate(r) for r in requests]


@app.post("/documents/requests", response_model=schemas.DocumentRequestOut, tags=["Documents"])
def request_document(
    payload: schemas.DocumentRequestCreate,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    ref = generate_ref("DOC")
    doc_req = models.DocumentRequest(
        reference_number=ref,
        user_id=current_user.id,
        document_type=payload.document_type,
        description=payload.description,
        status="pending",
    )
    db.add(doc_req)
    db.flush()

    notif = models.Notification(
        user_id=current_user.id,
        title="Document Request Submitted",
        body=f"Your request for '{payload.document_type}' has been received. Reference: {ref}",
        notification_type="document",
        related_id=doc_req.id,
    )
    db.add(notif)
    db.commit()
    db.refresh(doc_req)
    return schemas.DocumentRequestOut.model_validate(doc_req)


# ════════════════════════════════════════════════
# GRIEVANCES
# ════════════════════════════════════════════════
@app.post("/grievances", response_model=schemas.GrievanceOut, tags=["Grievances"])
def submit_grievance(
    payload: schemas.GrievanceCreate,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    ref = generate_ref("GRV")
    grievance = models.Grievance(
        reference_number=ref,
        user_id=current_user.id,
        category=payload.category,
        subject=payload.subject,
        description=payload.description,
        related_society=payload.related_society,
        status="submitted",
    )
    db.add(grievance)
    db.flush()

    history = models.GrievanceStatusHistory(
        grievance_id=grievance.id,
        status="submitted",
        notes="Grievance received",
    )
    db.add(history)

    notif = models.Notification(
        user_id=current_user.id,
        title="Grievance Submitted",
        body=f"Your grievance '{payload.subject}' has been registered. Reference: {ref}",
        notification_type="grievance",
        related_id=grievance.id,
    )
    db.add(notif)
    db.commit()
    db.refresh(grievance)

    return schemas.GrievanceOut(
        id=grievance.id,
        reference_number=grievance.reference_number,
        category=grievance.category,
        subject=grievance.subject,
        description=grievance.description,
        related_society=grievance.related_society,
        status=grievance.status,
        submitted_at=grievance.submitted_at,
        history=[schemas.GrievanceStatusOut.model_validate(h) for h in grievance.history],
    )


@app.get("/grievances", response_model=List[schemas.GrievanceOut], tags=["Grievances"])
def list_grievances(
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    grievances = (
        db.query(models.Grievance)
        .filter(models.Grievance.user_id == current_user.id)
        .order_by(models.Grievance.submitted_at.desc())
        .all()
    )
    result = []
    for g in grievances:
        result.append(schemas.GrievanceOut(
            id=g.id,
            reference_number=g.reference_number,
            category=g.category,
            subject=g.subject,
            description=g.description,
            related_society=g.related_society,
            status=g.status,
            submitted_at=g.submitted_at,
            history=[schemas.GrievanceStatusOut.model_validate(h) for h in g.history],
        ))
    return result


@app.get("/grievances/{grievance_id}", response_model=schemas.GrievanceOut, tags=["Grievances"])
def get_grievance(
    grievance_id: str,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(models.Grievance).filter(
        models.Grievance.id == grievance_id,
        models.Grievance.user_id == current_user.id,
    ).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return schemas.GrievanceOut(
        id=g.id,
        reference_number=g.reference_number,
        category=g.category,
        subject=g.subject,
        description=g.description,
        related_society=g.related_society,
        status=g.status,
        submitted_at=g.submitted_at,
        history=[schemas.GrievanceStatusOut.model_validate(h) for h in g.history],
    )


# ════════════════════════════════════════════════
# NOTIFICATIONS
# ════════════════════════════════════════════════
@app.get("/notifications", response_model=List[schemas.NotificationOut], tags=["Notifications"])
def list_notifications(
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    notifs = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [schemas.NotificationOut.model_validate(n) for n in notifs]


@app.patch("/notifications/{notification_id}/read", tags=["Notifications"])
def mark_notification_read(
    notification_id: str,
    current_user: models.User = Depends(auth_mod.get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}
