import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import "dotenv/config";
import { env } from "../../config/server";

const firebaseConfig = {
  projectId: env.FIREBASE_PROJECT_ID,
  credential: applicationDefault(),
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
