import { createHash, timingSafeEqual } from 'node:crypto';
import { envs } from '../config/envs.js';

const digest = (value) => createHash('sha256').update(value).digest();

// Autenticación entre servicios: valida el header X-API-Key contra INTERNAL_API_KEY.
// Si la clave no está configurada se rechaza todo.
export const internalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!envs.internalApiKey || typeof apiKey !== 'string') return res.sendStatus(401);
    if (!timingSafeEqual(digest(apiKey), digest(envs.internalApiKey))) return res.sendStatus(401);
    next();
}
