from models import Base, Column, Integer, String, ForeignKey, Boolean, DateTime, Enum, relationship, Role
from datetime import datetime
import re

class HumanResources(Base):
    __tablename__ = 'human_resources'
    
    id = Column(Integer, primary_key=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password = Column(String(200), nullable=False)
    contactnumber = Column(String(20), nullable=False)
    role = Column(Enum(Role), nullable=False, default=Role.HR_ADMIN)
    lastlogin = Column(DateTime, default=datetime.utcnow)
    isverified = Column(Boolean, default=False)
    verificationtoken = Column(String(200))
    verificationtokenexpires = Column(DateTime)
    resetpasswordtoken = Column(String(200))
    resetpasswordexpires = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    department_id = Column(Integer, ForeignKey('departments.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    department = relationship("Department", back_populates="human_resources")
    organization = relationship("Organization", back_populates="HRs")
    notices_created = relationship("Notice", back_populates="createdby")
    leaves_approved = relationship("Leave", back_populates="approvedby")
    requests_approved = relationship("GenerateRequest", back_populates="approvedby")
    interviews = relationship("InterviewInsight", back_populates="interviewer")
    balances_created = relationship("Balance", back_populates="createdBy")
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(pattern, email) is not None
