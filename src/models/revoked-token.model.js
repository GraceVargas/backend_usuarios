import mongoose from "mongoose";

// Tokens cerrados con logout. MongoDB borra cada documento cuando llega a expiresAt
// (índice TTL), porque a partir de ese momento el token ya está vencido de todas formas.
const revokedTokenSchema = new mongoose.Schema({
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 }
});

export const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);
