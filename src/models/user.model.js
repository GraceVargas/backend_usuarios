import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true, select: false },
    rol: { type: String, enum: ["cliente", "profesional", "administrador"], default: "cliente" },
    activo: { type: Boolean, default: true, index: true }
}, {
    timestamps: { createdAt: "fecha_registro", updatedAt: false },
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password_hash;
            delete ret.__v;
            return ret;
        }
    }
});

export const User = mongoose.model("User", userSchema);
