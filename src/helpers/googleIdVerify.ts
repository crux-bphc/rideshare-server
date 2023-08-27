import "dotenv/config";
import { env } from "../../config/server";
import {OAuth2Client} from "google-auth-library"

const client = new OAuth2Client();

export const verify  = async(token : string) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  const domain = payload['hd'];
  console.log(payload)
}
