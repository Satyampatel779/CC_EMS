from models import Base, Column, Integer, String, ForeignKey, DateTime, relationship
from datetime import datetime

class Department(Base):
    __tablename__ = 'departments'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    employees = relationship("Employee", back_populates="department")
    human_resources = relationship("HumanResources", back_populates="department")
    notices = relationship("Notice", back_populates="department")
    organization = relationship("Organization", back_populates="departments")
    requests = relationship("GenerateRequest", back_populates="department")
    recruitments = relationship("Recruitment", back_populates="department")
