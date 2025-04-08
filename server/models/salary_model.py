from models import Base, Column, Integer, String, Float, ForeignKey, DateTime, Enum, relationship, SalaryStatus
from datetime import datetime

class Salary(Base):
    __tablename__ = 'salaries'
    
    id = Column(Integer, primary_key=True)
    basicpay = Column(Float, nullable=False)
    bonuses = Column(Float, nullable=False)
    deductions = Column(Float, nullable=False)
    netpay = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False)
    duedate = Column(DateTime, nullable=False)
    paymentdate = Column(DateTime)
    status = Column(Enum(SalaryStatus), nullable=False, default=SalaryStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    
    # Relationships
    employee = relationship("Employee", back_populates="salaries")
    organization = relationship("Organization", back_populates="salaries")
    
    def validate_due_date(self):
        """Validate that due date is in the future"""
        return self.duedate >= datetime.utcnow()
