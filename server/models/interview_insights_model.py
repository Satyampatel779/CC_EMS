from models import Base, Column, Integer, String, ForeignKey, DateTime, Enum, relationship, InterviewStatus
from datetime import datetime

class InterviewInsight(Base):
    __tablename__ = 'interview_insights'
    
    id = Column(Integer, primary_key=True)
    feedback = Column(String(500))
    interviewdate = Column(DateTime)
    responsedate = Column(DateTime)
    status = Column(Enum(InterviewStatus), nullable=False, default=InterviewStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    applicant_id = Column(Integer, ForeignKey('applicants.id'), nullable=False)
    interviewer_id = Column(Integer, ForeignKey('human_resources.id'), nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    applicant = relationship("Applicant", back_populates="interviews")
    interviewer = relationship("HumanResources", back_populates="interviews")
    organization = relationship("Organization", back_populates="interviews")
