import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

// Formato almacenado: "<salt>:<hash>" en hexadecimal
export const hashPassword = async (password) => {
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(password, salt, KEY_LENGTH);
    return `${salt}:${hash.toString('hex')}`;
}

export const generateTemporaryPassword = () => {
    return randomBytes(12).toString('base64url');
}

export const verifyPassword = async (password, storedHash) => {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const storedBuffer = Buffer.from(hash, 'hex');
    const derived = await scryptAsync(password, salt, KEY_LENGTH);
    return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived);
}
