from models import Base, Column, Integer, String, ForeignKey, DateTime, Enum, relationship, AudienceType
from datetime import datetime

class Notice(Base):
    __tablename__ = 'notices'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    content = Column(String(1000), nullable=False)
    audience = Column(Enum(AudienceType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    department_id = Column(Integer, ForeignKey('departments.id'))
    employee_id = Column(Integer, ForeignKey('employees.id'))
    createdby_id = Column(Integer, ForeignKey('human_resources.id'), nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    department = relationship("Department", back_populates="notices")
    employee = relationship("Employee", back_populates="notices")
    createdby = relationship("HumanResources", back_populates="notices_created")
    organization = relationship("Organization", back_populates="notices")
