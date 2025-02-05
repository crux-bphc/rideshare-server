import "dotenv/config";
import { env } from "../../config/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://logto.local.crux-bphc.com/oidc/jwks"))

export const verify = async (token: string) => {
  try {
    interface AdditionalClaims {
      email: string;
      name: string;
      picture: string;
    }
    const { payload } = await jwtVerify<AdditionalClaims>(token, JWKS)

    return payload;
  } catch (err: any) {
    console.log("Error while verifying Google Token. Error : ", err.message);
  }
};
