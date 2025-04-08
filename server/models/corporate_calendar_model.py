from models import Base, Column, Integer, String, ForeignKey, DateTime, relationship
from datetime import datetime

class CorporateCalendar(Base):
    __tablename__ = 'corporate_calendar_events'
    
    id = Column(Integer, primary_key=True)
    eventtitle = Column(String(100), nullable=False)
    eventdate = Column(DateTime, nullable=False)
    description = Column(String(500), nullable=False)
    audience = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    organization = relationship("Organization", back_populates="events")
