import { z } from "zod";

export const tokenType = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phNo: z.coerce.number(),
  batch: z.number(),
});

export interface AdditionalClaims {
  email: string;
  name: string;
  picture: string;
}

export type Token = z.infer<typeof tokenType>;
