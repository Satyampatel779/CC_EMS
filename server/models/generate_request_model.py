from models import Base, Column, Integer, String, ForeignKey, DateTime, Enum, relationship, RequestStatus
from datetime import datetime

class GenerateRequest(Base):
    __tablename__ = 'generate_requests'
    
    id = Column(Integer, primary_key=True)
    requesttitle = Column(String(100), nullable=False)
    requestconent = Column(String(1000), nullable=False)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    department_id = Column(Integer, ForeignKey('departments.id'), nullable=False)
    approvedby_id = Column(Integer, ForeignKey('human_resources.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    employee = relationship("Employee", back_populates="requests")
    department = relationship("Department", back_populates="requests")
    approvedby = relationship("HumanResources", back_populates="requests_approved")
    organization = relationship("Organization", back_populates="requests")
