from models import Base, Column, Integer, String, Float, ForeignKey, DateTime, Enum, relationship, AttendanceStatus
from datetime import datetime

class Attendance(Base):
    __tablename__ = 'attendances'
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.PRESENT)
    checkInTime = Column(String(10))
    checkOutTime = Column(String(10))
    workHours = Column(Float, default=0)
    comments = Column(String(200), default='')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    employeeId = Column(Integer, ForeignKey('employees.id'), nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance")
    organization = relationship("Organization", back_populates="attendances")
