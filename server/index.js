import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import EmployeeAuthRouter from './routes/EmployeeAuth.route.js';
import HRAuthrouter from './routes/HRAuth.route.js';
import DashboardRouter from './routes/Dashboard.route.js';
import EmployeeRouter from './routes/Employee.route.js';
import HRRouter from './routes/HR.route.js';
import DepartmentRouter from './routes/Department.route.js';
import SalaryRouter from './routes/Salary.route.js';
import NoticeRouter from "./routes/Notice.route.js";
import LeaveRouter from './routes/Leave.route.js';
import AttendanceRouter from './routes/Attendance.route.js';
import RecruitmentRouter from './routes/Recruitment.route.js';
import ApplicantRouter from './routes/Applicant.route.js';
import InterviewInsightRouter from './routes/InterviewInsights.route.js';
import GenerateRequestRouter from './routes/GenerateRequest.route.js';
import CorporateCalendarRouter from './routes/CorporateCalendar.route.js';
import BalanceRouter from './routes/Balance.route.js';
import OrganizationRouter from './routes/Organization.route.js';
import DebugRouter from './routes/debug.route.js';
import { ConnectDB } from './config/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Parse JSON bodies
app.use(bodyParser.json());

// Parse cookie header
app.use(cookieParser());

// Important: Apply cookie parser before CORS
// Configure CORS with appropriate settings
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5176" // Add current frontend port
  ],
  credentials: true, // IMPORTANT: required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Add specific CORS header for cookies to work correctly
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Socket.IO setup with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5176" // Add current frontend port
    ],
    credentials: true,
  },
});

// Store io instance for use in controllers
app.set('io', io);

// Socket.io middleware for authentication - enhanced version
io.use((socket, next) => {
  try {
    // Get token from multiple possible sources
    const authToken = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    const hrCookieToken = socket.handshake.headers.cookie?.split(';')
      .find(c => c.trim().startsWith('HRtoken='))
      ?.split('=')[1];
      
    const emCookieToken = socket.handshake.headers.cookie?.split(';')
      .find(c => c.trim().startsWith('EMtoken='))
      ?.split('=')[1];
    
    // Use any available token
    const token = authToken || hrCookieToken || emCookieToken;
    
    // For debugging
    console.log(`Socket connection attempt [${socket.id}] - Auth sources:`, {
      authToken: !!authToken,
      hrCookie: !!hrCookieToken,
      emCookie: !!emCookieToken
    });
    
    // Check if connecting to a public namespace - add your public namespaces here
    const publicNamespaces = ['/public'];
    const isPublicNamespace = publicNamespaces.includes(socket.nsp.name);
    
    // For initial connection attempts without auth, return a more helpful error
    if (!token && !isPublicNamespace) {
      console.log(`Socket auth required: ${socket.id} - will reconnect after login`);
      return next(new Error('Authentication required'));
    }
    
    // Allow public namespace connections without auth
    if (!token && isPublicNamespace) {
      socket.auth = false;
      console.log(`Public namespace connection accepted: ${socket.id}`);
      return next();
    }
    
    // Verify token for authenticated namespaces
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        socket.auth = true;
        socket.user = decoded;
        // Store user type for role-based functionality
        socket.userType = decoded.HRid ? 'HR' : 'Employee';
        socket.userId = decoded.HRid || decoded.EMid;
        socket.orgId = decoded.ORGID;
        console.log(`Authenticated socket connection: ${socket.id} (${socket.userType} ${socket.userId})`);
        return next();
      } else {
        console.log('Socket authentication failed: Invalid token');
        return next(new Error('Invalid authentication token'));
      }
    }
    
    // This should never execute due to earlier checks
    return next(new Error('Authentication required'));
  } catch (error) {
    console.log('Socket authentication error:', error.message);
    return next(new Error(`Authentication error: ${error.message}`));
  }
});

// Socket.io connection event - enhanced with more structure
io.on('connection', (socket) => {
  const userType = socket.auth ? socket.userType : 'guest';
  const userId = socket.auth ? socket.userId : 'unknown';
  
  console.log(`User connected: ${socket.id} (${userType} ${userId})`);
  
  // Join organization room if authenticated
  if (socket.auth && socket.orgId) {
    socket.join(`org:${socket.orgId}`);
    console.log(`Socket ${socket.id} joined org room: org:${socket.orgId}`);
  }
  
  // Join user-specific room if authenticated
  if (socket.auth && socket.userId) {
    socket.join(`user:${socket.userId}`);
    console.log(`Socket ${socket.id} joined user room: user:${socket.userId}`);
  }
  
  // Handle client-side events
  if (socket.auth) {
    // HR-specific events
    if (socket.userType === 'HR') {
      socket.on('hr:dashboard:refresh', () => {
        io.to(`org:${socket.orgId}`).emit('dashboard:refresh');
        console.log(`HR ${socket.userId} triggered dashboard refresh for org ${socket.orgId}`);
      });
    }
    
    // Employee-specific events
    if (socket.userType === 'Employee') {
      socket.on('employee:attendance:mark', (data) => {
        console.log(`Employee ${socket.userId} marked attendance:`, data);
        // Process attendance data
      });
    }
  }
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (${userType} ${userId})`);
  });
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Enhanced request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, {
    cookie: req.headers.cookie ? 'Present' : 'None',
    origin: req.headers.origin || 'None'
  });
  
  // Debug cookie header content
  if (req.headers.cookie) {
    console.log("Cookies header content:", req.headers.cookie);
  }
  
  next();
});

// Add root health check endpoint
app.get('/', (req, res) => res.status(200).json({ success: true, message: 'API is running' }));

// Add cookie test endpoint for troubleshooting
app.get('/api/test-cookies', (req, res) => {
  // Set a test cookie
  res.cookie('test-cookie', 'cookie-value', {
    maxAge: 300000, // 5 minutes
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  
  return res.status(200).json({
    success: true, 
    message: 'Test cookie set', 
    receivedCookies: req.cookies,
    setCookie: 'test-cookie=cookie-value'
  });
});

// API routes
app.use("/api/auth/employee", EmployeeAuthRouter);
app.use("/api/auth/HR", HRAuthrouter);
app.use("/api/v1/dashboard", DashboardRouter); 
app.use("/api/v1/employee", EmployeeRouter);
app.use("/api/v1/HR", HRRouter);
app.use("/api/v1/department", DepartmentRouter);
app.use("/api/v1/salary", SalaryRouter);
app.use("/api/v1/notice", NoticeRouter);
app.use("/api/v1/leave", LeaveRouter);
app.use("/api/v1/attendance", AttendanceRouter);
app.use("/api/v1/recruitment", RecruitmentRouter);
app.use("/api/v1/applicant", ApplicantRouter);
app.use("/api/v1/interview-insights", InterviewInsightRouter);
app.use("/api/v1/generate-request", GenerateRequestRouter);
app.use("/api/v1/corporate-calendar", CorporateCalendarRouter);
app.use("/api/v1/balance", BalanceRouter);
app.use("/api/v1/organization", OrganizationRouter);

// Add debug routes (in development only)
if (process.env.NODE_ENV !== 'production') {
  app.use("/api/debug", DebugRouter);
  console.log("Debug routes enabled");
}

httpServer.listen(process.env.PORT, async () => {
  await ConnectDB();
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});