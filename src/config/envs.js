import 'dotenv/config';

export const envs = {
 mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  internalApiKey: process.env.INTERNAL_API_KEY
}