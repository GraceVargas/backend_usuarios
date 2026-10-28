import * as userService from '../services/users.services.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ message: "Lista de usuarios", payload: users });
    } catch (error) {
        res
      .status(500)
      .json({ message: "error interno del servidor", error: error.message });
    }

}

export const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id);
        if (user) {
            res.status(200).json({ message: "Usuario encontrado", payload: user });
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res
        .status(500)
        .json({ message: "error interno del servidor", error: error.message });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        if (user) {
            res.status(200).json({ message: "Usuario encontrado", payload: user });
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res
        .status(500)
        .json({ message: "error interno del servidor", error: error.message });
    }
}

export const createUserByAdmin = async (req, res) => {
    try {
        const { nombre, apellido, email, rol } = req.body ?? {};
        const newUser = await userService.createUserByAdmin({ nombre, apellido, email, rol });
        res.status(201).json({ message: "Usuario creado", payload: newUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Datos inválidos", error: error.message });
        }
        res
        .status(500)
        .json({ message: "error interno del servidor", error: error.message })
    }

}

export const getUserInternal = async (req, res) => {
    try {
        const user = await userService.getUserByIdIncludingInactive(req.params.id);
        if (user) {
            const { nombre, apellido, rol, activo } = user;
            res.status(200).json({ nombre, apellido, rol, activo });
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res
        .status(500)
        .json({ message: "error interno del servidor", error: error.message })
    }

}

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await userService.deleteUser(id);
        if (deletedUser) {
            res.status(200).json({ message: "Usuario desactivado", payload: deletedUser });
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res
        .status(500)
        .json({ message: "error interno del servidor", error: error.message })
    }

}
