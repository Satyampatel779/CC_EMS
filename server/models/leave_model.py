from models import Base, Column, Integer, String, ForeignKey, DateTime, Enum, relationship, LeaveStatus
from datetime import datetime

class Leave(Base):
    __tablename__ = 'leaves'
    
    id = Column(Integer, primary_key=True)
    startdate = Column(DateTime, nullable=False)
    enddate = Column(DateTime, nullable=False)
    title = Column(String(100), nullable=False, default="Leave Application")
    reason = Column(String(500), nullable=False)
    status = Column(Enum(LeaveStatus), nullable=False, default=LeaveStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    approvedby_id = Column(Integer, ForeignKey('human_resources.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    employee = relationship("Employee", back_populates="leaves")
    approvedby = relationship("HumanResources", back_populates="leaves_approved")
    organization = relationship("Organization", back_populates="leaves")
