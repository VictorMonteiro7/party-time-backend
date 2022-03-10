import JWT from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";
dotenv.config();
export const getUserByToken = async (token: string, allInfo: boolean) => {
  if (!token) return null;
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(
      decoded.id,
      allInfo === false && { password: 0 }
    );
    return user;
  } catch (err) {
    return null;
  }
};
