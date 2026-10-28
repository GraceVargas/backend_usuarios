import express from 'express';
import { login, logout, register } from '../controllers/auth.controller.js'
import { authentication } from '../middlewares/authentication.js';

const router = express.Router();

router.post("/sesiones", login);

router.delete("/sesiones", authentication, logout);

router.post("/usuarios", register);

export default router;
