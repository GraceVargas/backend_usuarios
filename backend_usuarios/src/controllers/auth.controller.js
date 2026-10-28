import { generateToken } from "../utils/token-generator.js";
import * as authService from '../services/auth.services.js';
import * as userService from '../services/users.services.js';

export async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};

        const { user, error } = await authService.validateCredentials(email, password);

        if (user) {
            const token = generateToken(user);
            res.json({ token })
        } else if (error === authService.LOGIN_ERRORS.ACCOUNT_DISABLED) {
            res.status(403).json({ message: "Cuenta deshabilitada" });
        } else {
            res.status(401).json({ message: "Usuario no autorizado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error interno del servidor" });
    }
}

// El token ya fue validado por el middleware authentication
export async function logout(req, res) {
    try {
        await authService.revokeToken(req.user.jti, req.user.exp);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error interno del servidor" });
    }
}

export async function register(req, res) {
    try {
        const { nombre, apellido, email, password } = req.body ?? {};
        const newUser = await userService.createUser({ nombre, apellido, email, password });
        const token = generateToken(newUser);
        res.status(201).json({ token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Datos inválidos", error: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "error interno del servidor" });
    }
}
