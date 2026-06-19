from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
from sqlalchemy import Column, DateTime, func


class Base(DeclarativeBase):
    """Base class for all models"""
    
    # Common columns for all models
    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        default=datetime.utcnow
    )
    
    pass
