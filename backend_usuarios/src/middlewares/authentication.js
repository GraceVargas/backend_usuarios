import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { isTokenRevoked } from '../services/auth.services.js';

const secret_key = process.env.JWT_SECRET_KEY;

export const authentication = async (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    let decoded;
    try {
        decoded = jwt.verify(token, secret_key);
    } catch {
        return res.sendStatus(401);
    }

    // Los tokens sin jti no se pueden revocar, así que no se aceptan
    if (!decoded.jti) return res.sendStatus(401);

    try {
        if (await isTokenRevoked(decoded.jti)) return res.sendStatus(401);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "error interno del servidor" });
    }

    req.user = decoded;
    next();
}

// Debe usarse después de authentication, que es quien carga req.user
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
}
