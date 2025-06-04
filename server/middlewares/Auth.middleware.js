import jwt from 'jsonwebtoken'

export const VerifyEmployeeToken = (req, res, next) => {
    // Check for token in cookies, Authorization header, or query parameter
    const cookieToken = req.cookies.EMtoken;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? 
                        authHeader.slice(7) : null;
    const queryToken = req.query.token;
    
    // Use token from any available source
    const token = cookieToken || headerToken || queryToken;
    
    console.log("Employee auth check - cookies:", JSON.stringify(req.cookies));
    console.log("Employee auth check - headers:", authHeader ? "Present" : "None");
    console.log("Employee auth check - query token:", queryToken ? "Present" : "None");
    
    if (!token) {
        console.log("Employee authentication failed: No token provided in cookies, headers, or query");
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        if (!decoded) {
            if (cookieToken) res.clearCookie("EMtoken");
            console.log("Employee authentication failed: Invalid token");
            return res.status(403).json({ success: false, message: "unauthenticated employee", gologin: true }) 
        }
        
        console.log("Employee token verified successfully for:", decoded.EMid);
        req.EMid = decoded.EMid
        req.EMrole = decoded.EMrole
        req.ORGID = decoded.ORGID
        next()
    } catch (error) {
        // Clear invalid token if it's an authentication error
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            if (cookieToken) res.clearCookie("EMtoken");
            console.error("Employee token validation error:", error.message);
            return res.status(401).json({ 
                success: false, 
                message: `Authentication error: ${error.message}. Please log in again.`, 
                gologin: true
            });
        }
        
        console.error("Employee authentication error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message }) 
    }
}

export const VerifyhHRToken = (req, res, next) => {
    // Log all request cookies and relevant headers for debugging
    console.log("HR auth check - cookies:", JSON.stringify(req.cookies));
    console.log("HR auth check - origin:", req.headers.origin || 'None');
    
    // Check for token in cookies, Authorization header, or query parameter
    const cookieToken = req.cookies.HRtoken;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? 
                        authHeader.slice(7) : null;
    const queryToken = req.query.token;
    
    // Use token from any available source
    const token = cookieToken || headerToken || queryToken;
    
    if (!token) {
        console.log(`HR authentication failed: No token provided. Origin: ${req.headers.origin || 'N/A'}`);
        return res.status(401).json({ 
            success: false, 
            message: "Authentication required. Please log in as HR admin.", 
            gologin: true,
            loginURL: "/auth/HR/login"
        }) 
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        if (!decoded) {
            if (cookieToken) res.clearCookie("HRtoken");
            console.log("HR authentication failed: Invalid token");
            return res.status(403).json({ 
                success: false, 
                message: "Invalid authentication token. Please log in again.", 
                gologin: true,
                loginURL: "/auth/HR/login"
            })
        }
        
        // Debug decoded token
        console.log("HR token decoded successfully:", {
            HRid: decoded.HRid,
            HRrole: decoded.HRrole,
            ORGID: decoded.ORGID
        });
        
        req.HRid = decoded.HRid
        req.ORGID = decoded.ORGID
        req.Role = decoded.HRrole
        next()
    } catch (error) {
        console.error("HR authentication error:", error.message);
        
        // Clear invalid token if it's an authentication error
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            if (cookieToken) res.clearCookie("HRtoken");
            return res.status(401).json({ 
                success: false, 
                message: `Authentication error: ${error.message}. Please log in again.`, 
                gologin: true,
                loginURL: "/auth/HR/login" 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during authentication", 
            error: error.message
        }) 
    }
}