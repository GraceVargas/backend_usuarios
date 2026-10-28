import { User } from '../models/user.model.js';
import { verifyPassword } from '../utils/password.js';

export const LOGIN_ERRORS = {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_DISABLED: 'ACCOUNT_DISABLED'
};

// Devuelve { user } si el login es válido, o { error } con el motivo del rechazo.
// El estado de la cuenta solo se informa después de validar la password,
// para no revelar si un email está registrado.
export const validateCredentials = async (email, password) => {
    if (typeof email !== 'string' || typeof password !== 'string') {
        return { error: LOGIN_ERRORS.INVALID_CREDENTIALS };
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
        .select('+password_hash');
    if (!user) return { error: LOGIN_ERRORS.INVALID_CREDENTIALS };

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) return { error: LOGIN_ERRORS.INVALID_CREDENTIALS };

    if (!user.activo) return { error: LOGIN_ERRORS.ACCOUNT_DISABLED };

    return { user };
}
