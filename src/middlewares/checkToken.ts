import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
//middleware to validate Token
export const checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [type, token] = (req.headers.authorization as string).split(" ");
    if (type !== "Bearer")
      return res.status(401).json({ error: "Token inválido" });
    if (!token) return res.status(401).json({ error: "Acesso negado!" });
    JWT.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (err) {
    return res.status(400).json({ error: "Acesso negado!" });
  }
};
