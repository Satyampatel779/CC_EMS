import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { HumanResources } from '../models/HR.model.js';
import { Employee } from '../models/Employee.model.js';
import { Organization } from '../models/Organization.model.js';

const router = express.Router();

// Check auth status without requiring authentication
router.get('/auth-status', (req, res) => {
  // Log all received headers and cookies for debugging
  console.log('Auth Debug - Headers:', {
    authorization: req.headers.authorization ? 'Present' : 'None',
    cookie: req.headers.cookie ? 'Present' : 'None',
    origin: req.headers.origin || 'None',
    referer: req.headers.referer || 'None',
  });
  
  console.log('Auth Debug - Cookies:', JSON.stringify(req.cookies));
  
  // Extract token from various sources
  const hrCookieToken = req.cookies?.HRtoken;
  const emCookieToken = req.cookies?.EMtoken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.startsWith('Bearer ') ? 
                      authHeader.slice(7) : null;
  
  // Verify tokens if they exist
  let hrCookieValid = false;
  let emCookieValid = false;
  let headerTokenValid = false;
  let headerTokenType = null;
  
  try {
    if (hrCookieToken) {
      const decoded = jwt.verify(hrCookieToken, process.env.JWT_SECRET);
      hrCookieValid = !!decoded;
    }
  } catch (e) {
    console.log('Invalid HR cookie token:', e.message);
  }
  
  try {
    if (emCookieToken) {
      const decoded = jwt.verify(emCookieToken, process.env.JWT_SECRET);
      emCookieValid = !!decoded;
    }
  } catch (e) {
    console.log('Invalid EM cookie token:', e.message);
  }
  
  try {
    if (headerToken) {
      const decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
      headerTokenValid = !!decoded;
      headerTokenType = decoded.HRid ? 'HR' : decoded.EMid ? 'Employee' : 'Unknown';
    }
  } catch (e) {
    console.log('Invalid header token:', e.message);
  }
  
  return res.json({
    success: true,
    tokens: {
      hrCookie: {
        present: !!hrCookieToken,
        valid: hrCookieValid
      },
      emCookie: {
        present: !!emCookieToken,
        valid: emCookieValid
      },
      header: {
        present: !!headerToken,
        valid: headerTokenValid,
        type: headerTokenType
      }
    },
    message: 'Auth debug info retrieved successfully'
  });
});

// Set a test cookie endpoint
router.get('/set-test-cookie', (req, res) => {
  res.cookie('debug-test-cookie', 'test-value', {
    maxAge: 300000, // 5 minutes
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
  
  return res.json({
    success: true,
    message: 'Debug test cookie set successfully'
  });
});

// Database status endpoint
router.get('/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Count documents in each collection
    const hrCount = await HumanResources.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const orgCount = await Organization.countDocuments();

    return res.json({
      success: true,
      database: {
        status: dbStates[dbState] || 'unknown',
        readyState: dbState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: {
          humanResources: hrCount,
          employees: employeeCount,
          organizations: orgCount
        }
      },
      message: 'Database status retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve database status'
    });
  }
});

export default router;
