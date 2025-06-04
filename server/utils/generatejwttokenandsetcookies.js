import jwt from 'jsonwebtoken'

export const GenerateJwtTokenAndSetCookiesEmployee = (res, EMid, EMrole, ORGID) => {
    const token = jwt.sign({ EMid, EMrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    console.log("Setting employee token cookie:", { token: token.substring(0, 15) + '...' });

    // Development-friendly cookie settings
    res.cookie("EMtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax', // Use 'lax' for development
        path: '/',
    })

    return token
}

export const GenerateJwtTokenAndSetCookiesHR = (res, HRid, HRrole, ORGID) => {
    const token = jwt.sign({ HRid, HRrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })

    console.log("Setting HR token cookie:", { token: token.substring(0, 15) + '...' });

    // Development-friendly cookie settings
    res.cookie("HRtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax', // Use 'lax' for development
        path: '/',
    })

    return token
}

// Add new function to return token for client-side storage
export const GenerateAuthResponseWithToken = (res, id, role, type, ORGID) => {
    const cookieName = type === 'HR' ? 'HRtoken' : 'EMtoken';
    const payload = type === 'HR' ? { HRid: id, HRrole: role, ORGID } : { EMid: id, EMrole: role, ORGID };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set cookie as before
    res.cookie(cookieName, token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
    });
    
    // Also return token in response for client-side storage
    return {
        token,
        expiresIn: 7 * 24 * 60 * 60 * 1000,
        role,
        id
    };
}