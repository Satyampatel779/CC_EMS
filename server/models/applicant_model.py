from models import Base, Column, Integer, String, ForeignKey, DateTime, Enum, relationship, RecruitmentStatus
from datetime import datetime
import re

class Applicant(Base):
    __tablename__ = 'applicants'
    
    id = Column(Integer, primary_key=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    contactnumber = Column(String(20), nullable=False)
    appliedrole = Column(String(100), nullable=False)
    recruitmentstatus = Column(Enum(RecruitmentStatus), default=RecruitmentStatus.NOT_SPECIFIED)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    organization = relationship("Organization", back_populates="applicants")
    interviews = relationship("InterviewInsight", back_populates="applicant")
    applications = relationship("Recruitment", secondary="applicant_recruitment", back_populates="applications")
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(pattern, email) is not None
