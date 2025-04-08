from models import Base, Column, String, DateTime, relationship
from datetime import datetime

class Organization(Base):
    __tablename__ = 'organizations'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=False)
    OrganizationURL = Column(String(200), nullable=False, unique=True)
    OrganizationMail = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employees = relationship("Employee", back_populates="organization")
    HRs = relationship("HumanResources", back_populates="organization")
    departments = relationship("Department", back_populates="organization")
    notices = relationship("Notice", back_populates="organization")
    leaves = relationship("Leave", back_populates="organization")
    salaries = relationship("Salary", back_populates="organization")
    requests = relationship("GenerateRequest", back_populates="organization")
    events = relationship("CorporateCalendar", back_populates="organization")
    balances = relationship("Balance", back_populates="organization")
    attendances = relationship("Attendance", back_populates="organization")
    applicants = relationship("Applicant", back_populates="organization")
    interviews = relationship("InterviewInsight", back_populates="organization")
    recruitments = relationship("Recruitment", back_populates="organization")
