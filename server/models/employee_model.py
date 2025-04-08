from models import Base, Column, Integer, String, ForeignKey, Boolean, DateTime, Enum, relationship, Role
from datetime import datetime
import re

class Employee(Base):
    __tablename__ = 'employees'
    
    id = Column(Integer, primary_key=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password = Column(String(200), nullable=False)
    contactnumber = Column(String(20), nullable=False)
    role = Column(Enum(Role), nullable=False)
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
    attendance_id = Column(Integer, ForeignKey('attendances.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    department = relationship("Department", back_populates="employees")
    attendance = relationship("Attendance", back_populates="employee")
    organization = relationship("Organization", back_populates="employees")
    notices = relationship("Notice", back_populates="employee")
    salaries = relationship("Salary", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    requests = relationship("GenerateRequest", back_populates="employee")
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(pattern, email) is not None
