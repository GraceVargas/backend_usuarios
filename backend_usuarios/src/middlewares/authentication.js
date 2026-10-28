import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret_key = process.env.JWT_SECRET_KEY;

export const authentication = (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) return res.sendStatus(401);
        jwt.verify(token, secret_key, (err, decoded) => {
        if (err) return res.sendStatus(401);
        req.user = decoded;
        next();
    });
}

// Debe usarse después de authentication, que es quien carga req.user
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
}
