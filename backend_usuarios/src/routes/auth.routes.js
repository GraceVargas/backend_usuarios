import express from 'express';
import { login, register } from '../controllers/auth.controller.js'

const router = express.Router();

router.post("/sesiones", login);

router.post("/usuarios", register);

export default router;
