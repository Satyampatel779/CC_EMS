# Import necessary modules
from flask import Flask, request, jsonify
from functools import wraps

# Initialize Flask app
app = Flask(__name__)

attendance = {}
leave_requests = {}

# Function to check if a user is authenticated
def verify_employee_token(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if token != "valid_token":
            return jsonify({"message": "Unauthorized"}), 401
        return func(*args, **kwargs)
    return decorated_function

# Role-based authorization decorator
def role_authorization(required_role):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            user = request.headers.get("User")
            if employees.get(user) and employees[user]["role"] == required_role:
                return func(*args, **kwargs)
            return jsonify({"message": "Forbidden"}), 403
        return decorated_function
    return decorator

# Route to handle employee signup
@app.route("/signup", methods=["POST"])
@role_authorization("HR-Admin")
def handle_employee_signup():
    data = request.json
    employee_id = len(employees) + 1
    employees[data["email"]] = {"id": employee_id, "email": data["email"], "password": data["password"], "role": "Employee"}
    return jsonify({"message": "Employee created successfully", "employee_id": employee_id})

# Route to handle employee login
@app.route("/login", methods=["POST"])
def handle_employee_login():
    data = request.json
    for employee in employees.values():
        if employee["email"] == data["email"] and employee["password"] == data["password"]:
            return jsonify({"message": "Login successful", "employee_id": employee["id"]})
    return jsonify({"message": "Invalid credentials"}), 401

# Route to check if the user is logged in
@app.route("/check-login", methods=["GET"])
@verify_employee_token
def handle_employee_check():
    return jsonify({"message": "Employee is logged in"})

# HR - Route to get all employees
@app.route("/hr/employees", methods=["GET"])
@role_authorization("HR-Admin")
def get_all_employees():
    return jsonify({"employees": list(employees.values())})

# Attendance routes
@app.route("/attendance", methods=["POST"])
@verify_employee_token
def mark_attendance():
    employee_email = request.json.get("email")
    attendance[employee_email] = "Present"
    return jsonify({"message": f"Attendance marked for {employee_email}."})

@app.route("/attendance", methods=["GET"])
@verify_employee_token
def get_attendance():
    return jsonify({"attendance": attendance})

# Leave request routes
@app.route("/leave", methods=["POST"])
@verify_employee_token
def request_leave():
    employee_email = request.json.get("email")
    leave_type = request.json.get("type")
    leave_requests[employee_email] = leave_type
    return jsonify({"message": f"Leave requested by {employee_email} for {leave_type}."})

@app.route("/leave", methods=["GET"])
@verify_employee_token
def get_leave_requests():
    return jsonify({"leave_requests": leave_requests})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5001)
