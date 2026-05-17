import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (typeof decoded === 'object' && 'id' in decoded) {
            req.userId = decoded.id;
            req.userRole = decoded.role;
        }
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
export const adminOnly = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
export const doctorOnly = (req, res, next) => {
    if (req.userRole !== 'DOCTOR' && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Doctor access required' });
    }
    next();
};
//# sourceMappingURL=auth.js.map