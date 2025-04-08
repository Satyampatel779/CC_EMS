from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import enum

Base = declarative_base()

# Define any enums needed for model fields
class LeaveStatus(enum.Enum):
    PENDING = "Pending"
    REJECTED = "Rejected"
    APPROVED = "Approved"

class SalaryStatus(enum.Enum):
    PENDING = "Pending"
    DELAYED = "Delayed"
    PAID = "Paid"

class Role(enum.Enum):
    HR_ADMIN = "HR-Admin"
    EMPLOYEE = "Employee"

class RecruitmentStatus(enum.Enum):
    CONDUCT_INTERVIEW = "Conduct-Interview"
    REJECTED = "Rejected"
    PENDING = "Pending"
    INTERVIEW_COMPLETED = "Interview Completed"
    NOT_SPECIFIED = "Not Specified"

class InterviewStatus(enum.Enum):
    PENDING = "Pending"
    CANCELED = "Canceled"
    COMPLETED = "Completed"

class RequestStatus(enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved" 
    DENIED = "Denied"

class AttendanceStatus(enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    LATE = "Late"
    HALF_DAY = "Half Day"
    LEAVE = "Leave"

class AudienceType(enum.Enum):
    DEPARTMENT = "Department-Specific"
    EMPLOYEE = "Employee-Specific"
