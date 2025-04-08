from models import Base, Column, Integer, String, Float, ForeignKey, DateTime, relationship
from datetime import datetime

class Balance(Base):
    __tablename__ = 'balances'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    availableamount = Column(Float, nullable=False)
    totalexpenses = Column(Float, nullable=False)
    expensemonth = Column(String(20), nullable=False)
    submitdate = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    createdBy_id = Column(Integer, ForeignKey('human_resources.id'))
    
    # Relationships
    organization = relationship("Organization", back_populates="balances")
    createdBy = relationship("HumanResources", back_populates="balances_created")
