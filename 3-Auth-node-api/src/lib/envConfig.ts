import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DB_URI: string;
    CLIENT_URI: string;
    ANGULAR_CLIENT_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || "Production",
    PORT: Number(process.env.PORT) || 8000,
    DB_URI: process.env.DB_URI || (() => { throw new Error("DB_URI is not set"); })(),
    CLIENT_URI: process.env.CLIENT_URI || "http://localhost:5173",
    ANGULAR_CLIENT_URI: process.env.ANGULAR_CLIENT_URI || "http://localhost:4200",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "secret1",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "secret2"
};

export { env };
