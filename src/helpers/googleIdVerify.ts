import "dotenv/config";
import { env } from "../../config/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export const verify = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const domain = payload["hd"];

    if (domain === "hyderabad.bits-pilani.ac.in") return payload;
    else throw new Error("Invalid domain");
  } catch (err: any) {
    console.log("Error while verifying Google Token. Error : ", err.message);
  }
};
