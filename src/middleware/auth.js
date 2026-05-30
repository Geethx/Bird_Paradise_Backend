import jwt from 'jsonwebtoken';

export async function authenticateAdmin(req, res, next) {

    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

export function authenticateGuest(req, res, next) {
    const authHeader = req.header('Authorization');


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'guest') {
            return res.status(403).json({ message: 'Access denied. Guests only.' });
        }

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}
