from models import Base, Column, Integer, String, ForeignKey, DateTime, Table, relationship
from datetime import datetime
from sqlalchemy import Table

# Association table for many-to-many relationship
applicant_recruitment = Table(
    'applicant_recruitment',
    Base.metadata,
    Column('applicant_id', Integer, ForeignKey('applicants.id')),
    Column('recruitment_id', Integer, ForeignKey('recruitments.id'))
)

class Recruitment(Base):
    __tablename__ = 'recruitments'
    
    id = Column(Integer, primary_key=True)
    jobtitle = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    department_id = Column(Integer, ForeignKey('departments.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    department = relationship("Department", back_populates="recruitments")
    organization = relationship("Organization", back_populates="recruitments")
    applications = relationship("Applicant", secondary="applicant_recruitment", back_populates="applications")
