"""
schemas.py – Pydantic request / response models for ARAV AI.
"""
from __future__ import annotations
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str
    mobile_number: str
    email: Optional[EmailStr] = None
    password: str
    state: Optional[str] = None
    district: Optional[str] = None
    preferred_language: str = "en"
    cooperative_society: Optional[str] = None

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        allowed = {"en", "hi", "ta", "te"}
        if v not in allowed:
            raise ValueError(f"Language must be one of {allowed}")
        return v


class LoginRequest(BaseModel):
    mobile_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    full_name: str
    mobile_number: str
    email: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    preferred_language: str
    cooperative_society: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    state: Optional[str] = None
    district: Optional[str] = None
    preferred_language: Optional[str] = None
    cooperative_society: Optional[str] = None


# ──────────────────────────────────────────────
# CHAT
# ──────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    conversation_id: Optional[str] = None

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        allowed = {"en", "hi", "ta", "te"}
        if v not in allowed:
            raise ValueError(f"Language must be one of {allowed}")
        return v


class SourceCitation(BaseModel):
    title: str
    url: Optional[str] = None
    category: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    sources: List[SourceCitation] = []
    language: str
    created_at: datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[SourceCitation]] = None
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    title: Optional[str] = None
    language: str
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailOut(BaseModel):
    id: str
    title: Optional[str] = None
    language: str
    messages: List[MessageOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# VOICE
# ──────────────────────────────────────────────
class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    confidence: Optional[float] = None


class SynthesizeRequest(BaseModel):
    text: str
    language: str = "en"


# ──────────────────────────────────────────────
# SCHEMES
# ──────────────────────────────────────────────
class SchemeOut(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    required_documents: Optional[List[str]] = None
    application_procedure: Optional[str] = None
    official_url: Optional[str] = None
    applicable_state: Optional[str] = None
    ministry: Optional[str] = None
    is_active: bool
    verified_at: Optional[datetime] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# SOCIETIES
# ──────────────────────────────────────────────
class SocietyOut(BaseModel):
    id: str
    name: str
    society_type: Optional[str] = None
    registration_number: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    services: Optional[List[str]] = None
    is_verified: bool
    verification_source: Optional[str] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# APPLICATIONS
# ──────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    application_type: str
    title: str
    form_data: Optional[dict] = None


class StatusHistoryOut(BaseModel):
    status: str
    notes: Optional[str] = None
    changed_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: str
    reference_number: str
    application_type: str
    title: str
    status: str
    form_data: Optional[dict] = None
    submitted_at: datetime
    history: List[StatusHistoryOut] = []

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# DOCUMENTS
# ──────────────────────────────────────────────
class DocumentRequestCreate(BaseModel):
    document_type: str
    description: Optional[str] = None


class DocumentRequestOut(BaseModel):
    id: str
    reference_number: str
    document_type: str
    description: Optional[str] = None
    status: str
    notes: Optional[str] = None
    requested_at: datetime
    ready_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# GRIEVANCES
# ──────────────────────────────────────────────
class GrievanceCreate(BaseModel):
    category: str
    subject: str
    description: str
    related_society: Optional[str] = None


class GrievanceStatusOut(BaseModel):
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GrievanceOut(BaseModel):
    id: str
    reference_number: str
    category: str
    subject: str
    description: str
    related_society: Optional[str] = None
    status: str
    submitted_at: datetime
    history: List[GrievanceStatusOut] = []

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# NOTIFICATIONS
# ──────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: str
    title: str
    body: str
    notification_type: str
    related_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
