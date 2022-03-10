import multer from "multer";
import path from "path";

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
