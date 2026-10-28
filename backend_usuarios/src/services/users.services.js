import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { generateTemporaryPassword, hashPassword } from '../utils/password.js';

// Roles que solo puede asignar un administrador
export const ADMIN_ASSIGNABLE_ROLES = ['profesional', 'administrador'];

const validationError = (path, message) => {
    const error = new mongoose.Error.ValidationError();
    error.addError(path, new mongoose.Error.ValidatorError({ path, message }));
    return error;
}

export const getAllUsers = async () => {
    return await User.find({ activo: true });
}

export const getUserById = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await User.findOne({ _id: id, activo: true });
}

// Para consultas entre servicios: incluye usuarios inactivos,
// el servicio que consulta decide qué hacer según "activo"
export const getUserByIdIncludingInactive = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await User.findById(id);
}

export const createUser = async ({ nombre, apellido, email, password }) => {
    if (typeof password !== 'string' || password.length === 0) {
        throw validationError('password', 'Path `password` is required.');
    }
    const password_hash = await hashPassword(password);
    return await User.create({ nombre, apellido, email, password_hash });
}

// Alta realizada por un administrador: se genera una contraseña temporal.
// El envío de la contraseña por mail queda fuera del alcance actual.
export const createUserByAdmin = async ({ nombre, apellido, email, rol }) => {
    if (!ADMIN_ASSIGNABLE_ROLES.includes(rol)) {
        throw validationError('rol', `rol debe ser uno de: ${ADMIN_ASSIGNABLE_ROLES.join(', ')}`);
    }
    const password_hash = await hashPassword(generateTemporaryPassword());
    return await User.create({ nombre, apellido, email, password_hash, rol });
}

// Baja lógica: el usuario se marca como inactivo en lugar de borrarse
export const deleteUser = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return await User.findOneAndUpdate(
        { _id: id, activo: true },
        { activo: false },
        { returnDocument: 'after' }
    );
}
