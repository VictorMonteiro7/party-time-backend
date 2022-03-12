import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";

export const upload = multer({
  dest: path.join(__dirname, "../../tmp"),
  fileFilter: (req, file, cb) => {
    let types = ["image/png", "image/jpeg", "image/jpg"];
    if (!types.includes(file.mimetype)) {
      return cb(new Error());
    }
    cb(null, types.includes(file.mimetype));
  },
  limits: {
    fieldSize: 1024 * 1024 * 5,
  },
});

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.file) {
      const redImg = sharp(req.file.path);
      console.log(redImg);
    }
  } catch (err) {
    res.status(400).json({ error: "Erro ao enviar arquivo" });
    return;
  }
};
