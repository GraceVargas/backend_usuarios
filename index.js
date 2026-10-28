import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import userRouter from "./src/routes/users.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import { envs } from "./src/config/envs.js";
import connectDB from './src/config/db.js';

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = envs.port;

await connectDB();

app.use(authRouter);
app.use(userRouter);

app.use((_req, res) => {
    res.status(404).send("Ruta inválida.")
})


// En Vercel la app corre como función serverless: se exporta en lugar de escuchar un puerto
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on PORT: ${port}`);
    })
}

export default app;