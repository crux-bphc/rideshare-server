import { z } from "zod";
import type { StringValue } from "ms";

export const serverSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_SOCKET: z.string().min(1),
    PORT: z.coerce.number().default(3000),
    PGPORT: z.coerce.number().default(5432),
    GOOGLE_CLIENT_ID: z.string().min(1),
    ACCESS_TOKEN_EXPIRY: z.custom<StringValue>(),
    REFRESH_TOKEN_EXPIRY: z.custom<StringValue>(),
    ACCESS_JWT_SECRET: z.string().min(8),
    REFRESH_JWT_SECRET: z.string().min(8),
    FIREBASE_PROJECT_ID: z.string().min(1),
    // is optional only when running the dev container
    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
    TEST_EMAIL: z.string().min(1),
    DB_HOST: z.string().min(1),
  })
  .refine(
    (schema) => {
      if (
        schema.NODE_ENV !== "development" &&
        schema.GOOGLE_APPLICATION_CREDENTIALS === undefined
      )
        return false;
      return true;
    },
    {
      message: "GOOGLE_APPLICATION_CREDENTIALS ENV VAR not found",
    }
  );
