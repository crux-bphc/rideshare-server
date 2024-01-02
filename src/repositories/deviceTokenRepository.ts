import { AppDataSource } from "../data-source";
import { deviceToken } from "../entity/deviceToken";

export const deviceTokenRepository = AppDataSource.getRepository(deviceToken);
