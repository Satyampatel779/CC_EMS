import mongoose from 'mongoose';

// Import the Employee model
const EmployeeSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactnumber: { type: String, required: true },
    role: { type: String, enum: ["HR-Admin", "Employee"], required: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
    address: { type: String, default: null },
    employeeId: { type: String, unique: true, sparse: true },
    position: { type: String, default: null },
    joiningDate: { type: Date, default: null },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract", "Intern"], default: "Full-time" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    workLocation: { type: String, default: null },
    status: { type: String, enum: ["Active", "Inactive", "On Leave", "Terminated"], default: "Active" },
    emergencyContact: {
        name: { type: String, default: null },
        relationship: { type: String, default: null },
        phone: { type: String, default: null }
    },
    skills: [{ type: String }],
    education: [{ degree: String, institution: String, year: Date }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    organizationID: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
    notice: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notice" }],
    salary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Salary" }],
    leaverequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "Leave" }],
    generaterequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "GenerateRequest" }],
    lastlogin: { type: Date, default: Date.now },
    isverified: { type: Boolean, default: false },
    verificationtoken: { type: String },
    verificationtokenexpires: { type: Date },
    resetpasswordtoken: { type: String },
    resetpasswordtokenexpires: { type: Date }
}, { timestamps: true });

const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkEmployeeData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    const employees = await Employee.find({}).populate('department', 'name').populate('manager', 'firstname lastname').limit(3);
    console.log(`\n📊 Found ${employees.length} employees in database`);
    
    if (employees.length === 0) {
      console.log('❌ No employees found in database!');
      await mongoose.disconnect();
      return;
    }
    
    employees.forEach((emp, index) => {
      console.log(`\n👤 Employee ${index + 1}:`);
      console.log('  Name:', emp.firstname, emp.lastname);
      console.log('  Employee ID:', emp.employeeId || 'NOT SET');
      console.log('  Department:', emp.department?.name || 'NOT SET');
      console.log('  Position:', emp.position || 'NOT SET');
      console.log('  Join Date:', emp.joiningDate || 'NOT SET');
      console.log('  Employment Type:', emp.employmentType || 'NOT SET');
      console.log('  Work Location:', emp.workLocation || 'NOT SET');
      console.log('  Manager:', emp.manager ? `${emp.manager.firstname} ${emp.manager.lastname}` : 'NOT SET');
      console.log('  Date of Birth:', emp.dateOfBirth || 'NOT SET');
      console.log('  Gender:', emp.gender || 'NOT SET');
      console.log('  Address:', emp.address || 'NOT SET');
      console.log('  Emergency Contact:', emp.emergencyContact?.name ? 
        `${emp.emergencyContact.name} (${emp.emergencyContact.relationship}) - ${emp.emergencyContact.phone}` : 'NOT SET');
      console.log('  Status:', emp.status || 'NOT SET');
    });
    
    console.log('\n🔍 Summary:');
    const fieldsToCheck = ['employeeId', 'position', 'joiningDate', 'employmentType', 'workLocation', 'dateOfBirth', 'gender', 'address'];
    fieldsToCheck.forEach(field => {
      const populated = employees.filter(emp => emp[field] && emp[field] !== null && emp[field] !== '').length;
      console.log(`  ${field}: ${populated}/${employees.length} employees have this field set`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkEmployeeData();
