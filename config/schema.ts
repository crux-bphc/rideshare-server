import { z } from "zod";

export const serverSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_SOCKET: z.string().min(1),
    // PROD_URL: z.string().url().min(1),
    PORT: z.coerce.number().default(3000),
  });