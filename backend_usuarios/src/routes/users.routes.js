import express from 'express';
import * as userController from '../controllers/users.controller.js'
import { authentication, authorize } from '../middlewares/authentication.js';
import { internalApiKey } from '../middlewares/internal-api-key.js';

const router = express.Router();

router.get("/usuarios", authentication, authorize("administrador"), userController.getAllUsers);

// Debe declararse antes de "/usuarios/:id" para que "me" no se interprete como un id
router.get("/usuarios/me", authentication, userController.getMe);

router.get("/usuarios/:id", authentication, authorize("administrador"), userController.getUserById);

router.delete("/usuarios/:id", authentication, authorize("administrador"), userController.deleteUser);

router.post("/admin/usuarios", authentication, authorize("administrador"), userController.createUserByAdmin);

// Consulta entre servicios (API de turnos): se autentica con X-API-Key, no con JWT
router.get("/interno/usuarios/:id", internalApiKey, userController.getUserInternal);

export default router;
