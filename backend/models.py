"""
models.py – SQLAlchemy ORM models for ARAV AI.
All tables use UUID primary keys and include created_at / updated_at timestamps.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    String, Text, Numeric, JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.orm import relationship

from database import Base


class UniversalUUID(TypeDecorator):
    """Platform-agnostic UUID type: uses native PostgreSQL UUID on Postgres, CHAR(36) elsewhere."""
    impl = CHAR(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID(as_uuid=False))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return str(value)


def utcnow():
    return datetime.now(timezone.utc)


def new_uuid():
    return str(uuid.uuid4())


# ──────────────────────────────────────────────
# USERS
# ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    full_name = Column(String(200), nullable=False)
    mobile_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True, index=True)
    hashed_password = Column(String(512), nullable=False)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    preferred_language = Column(String(20), default="en", nullable=False)
    cooperative_society = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_staff = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # relationships
    conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    document_requests = relationship("DocumentRequest", back_populates="user", cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# ──────────────────────────────────────────────
# SOCIETIES
# ──────────────────────────────────────────────
class Society(Base):
    __tablename__ = "societies"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    name = Column(String(300), nullable=False, index=True)
    society_type = Column(String(100), nullable=True)   # PACS, DCB, etc.
    registration_number = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True, index=True)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(200), nullable=True)
    services = Column(JSON, nullable=True)             # list of service strings
    is_verified = Column(Boolean, default=False)
    verification_source = Column(String(200), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    memberships = relationship("Membership", back_populates="society")


# ──────────────────────────────────────────────
# MEMBERSHIPS
# ──────────────────────────────────────────────
class Membership(Base):
    __tablename__ = "memberships"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    society_id = Column(UniversalUUID(), ForeignKey("societies.id"), nullable=True)
    society_name = Column(String(300), nullable=True)   # free-text fallback
    status = Column(String(50), default="pending")      # pending / active / rejected / suspended
    membership_number = Column(String(100), nullable=True)
    application_data = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), default=utcnow)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="memberships")
    society = relationship("Society", back_populates="memberships")


# ──────────────────────────────────────────────
# SCHEMES
# ──────────────────────────────────────────────
class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    name = Column(String(300), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    required_documents = Column(JSON, nullable=True)
    application_procedure = Column(Text, nullable=True)
    official_url = Column(String(500), nullable=True)
    applicable_state = Column(String(100), nullable=True, index=True)
    ministry = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    source = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


# ──────────────────────────────────────────────
# APPLICATIONS
# ──────────────────────────────────────────────
class Application(Base):
    __tablename__ = "applications"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    reference_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    application_type = Column(String(100), nullable=False)  # membership / document / scheme / loan
    title = Column(String(300), nullable=False)
    status = Column(String(50), default="submitted")
    form_data = Column(JSON, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="applications")
    history = relationship("ApplicationStatusHistory", back_populates="application", order_by="ApplicationStatusHistory.created_at")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    application_id = Column(UniversalUUID(), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    changed_by = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    application = relationship("Application", back_populates="history")


# ──────────────────────────────────────────────
# DOCUMENT REQUESTS
# ──────────────────────────────────────────────
class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    reference_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending / processing / ready / delivered
    notes = Column(Text, nullable=True)
    requested_at = Column(DateTime(timezone=True), default=utcnow)
    ready_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="document_requests")


# ──────────────────────────────────────────────
# GRIEVANCES
# ──────────────────────────────────────────────
class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    reference_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    subject = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    related_society = Column(String(300), nullable=True)
    status = Column(String(50), default="submitted")
    submitted_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="grievances")
    history = relationship("GrievanceStatusHistory", back_populates="grievance", order_by="GrievanceStatusHistory.created_at")


class GrievanceStatusHistory(Base):
    __tablename__ = "grievance_status_history"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    grievance_id = Column(UniversalUUID(), ForeignKey("grievances.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    grievance = relationship("Grievance", back_populates="history")


# ──────────────────────────────────────────────
# CHAT
# ──────────────────────────────────────────────
class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=True)
    language = Column(String(20), default="en")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", order_by="ChatMessage.created_at", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    conversation_id = Column(UniversalUUID(), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)   # user | assistant
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)        # list of source dicts
    language = Column(String(20), default="en")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    conversation = relationship("ChatConversation", back_populates="messages")


# ──────────────────────────────────────────────
# KNOWLEDGE SOURCES
# ──────────────────────────────────────────────
class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    title = Column(String(300), nullable=False)
    category = Column(String(100), nullable=True, index=True)
    content = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    ministry = Column(String(200), nullable=True)
    applicable_state = Column(String(100), nullable=True)
    language = Column(String(20), default="en")
    keywords = Column(JSON, nullable=True)          # list of keyword strings
    is_verified = Column(Boolean, default=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


# ──────────────────────────────────────────────
# NOTIFICATIONS
# ──────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UniversalUUID(), primary_key=True, default=new_uuid)
    user_id = Column(UniversalUUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info / application / document / grievance / scheme
    related_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
