import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const secret_key = process.env.JWT_SECRET_KEY;

// jwtid (claim "jti") identifica a cada token, para poder revocarlo en el logout
export const generateToken = (userData) => {
    const user = {id: userData.id, rol: userData.rol};
    const options = { expiresIn: '1h', jwtid: randomUUID() };
    return jwt.sign(user, secret_key, options);
}
