# Import all models to make them available through models module

from models import *
from organization_model import Organization
from employee_model import Employee
from hr_model import HumanResources
from department_model import Department
from salary_model import Salary
from leave_model import Leave
from notice_model import Notice
from generate_request_model import GenerateRequest
from corporate_calendar_model import CorporateCalendar
from balance_model import Balance
from attendance_model import Attendance
from applicant_model import Applicant
from recruitment_model import Recruitment, applicant_recruitment
from interview_insights_model import InterviewInsight
