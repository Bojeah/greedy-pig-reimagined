import dotenv from "dotenv";

dotenv.config({ quiet: true });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: required("JWT_SECRET"),
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 30,
  apiRateLimit: Number(process.env.API_RATE_LIMIT) || 600,
};
