import sharp from "sharp";
import bcrypt, { compare } from "bcrypt";
import { Request, Response } from "express";
import Party from "../models/Party";
import { getUserByToken } from "../helpers/getUserByToken";
import User from "../models/User";
import fs, { unlinkSync } from "fs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const config = cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const cloudImg = cloudinary.v2;
//Criar uma nova festa
export const postParty = async (req: Request, res: Response) => {
  const [type, token] = (req.headers["authorization"] as string).split(" ");
  if (type !== "Bearer")
    return res.status(403).json({ error: "Não autorizado." });
  try {
    let photos: string[] = [];
    let files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { title, description, date, privacy } = req.body;
    if (!title || !description || !date)
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    const user = (await getUserByToken(token, false)) as { _id: string };
    if (user === null)
      return res.status(400).json({ error: "Usuário não encontrado." });
    // const imagens = await sharp(req.files.path)
    if (req.files) {
      for (let imagem of files.photos) {
        const fileName = `${imagem.filename}.webp`;
        await cloudImg.uploader.upload(
          imagem.path,
          {
            eager: {
              width: 300,
              height: 300,
              crop: "fill",
            },
            type: "upload",
            resource_type: "image",
            format: "webp",
            folder: `users/${user._id}/${title}`,
            public_id: imagem.filename,
          },
          (err, result) => {
            if (err)
              return res.status(400).json({ error: "Erro ao enviar imagem" });
            if (result) photos.push(result.eager[0].secure_url);
          }
        );
        //https://res.cloudinary.com/dzo5w6jru/image/upload/v1647198005/user/husky_ouw4ke.jpg
        unlinkSync(imagem.path);
      }
    }
    const novaFesta = new Party({
      title,
      description,
      date,
      photos,
      privacy: privacy ? privacy : false,
      userId: user._id,
    });
    await novaFesta.save();
    return res.status(200).json({ message: "Festa criada com sucesso!" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Erro ao criar a festa" });
    return;
  }
};

//Pegar festas de acordo com o usuário logado.
export const getUserParties = async (req: Request, res: Response) => {
  const [type, token] = (req.headers["authorization"] as string).split(" ");
  if (type !== "Bearer")
    return res.status(403).json({ error: "Não autorizado." });
  try {
    const conf = (await getUserByToken(token, false)) as { _id: string };
    const user = await User.findById({ _id: conf._id });
    if (!user) return res.status(403).json({ message: "Acesso negado!" });
    const parties = await Party.find({ userId: user._id });
    if (parties.length === 0)
      return res.json({ message: "Nenhuma festa encontrada!" });
    res.json({ parties });
  } catch (err) {
    res.status(400).json({ error: "Erro ao buscar festas do usuário." });
    return;
  }
};

//Pegar todas as festas (rota pública)
export const getParties = async (req: Request, res: Response) => {
  try {
    const parties = await Party.find(
      {
        privacy: false,
      },
      { privacy: 0 }
    ).sort({ date: -1 });
    if (parties.length === 0)
      return res.json({ message: "Nenhuma festa encontrada." });
    res.status(200).json(parties);
  } catch (err) {
    res.status(400).json({ error: "Erro ao buscar festas." });
    return;
  }
};

//Pegar festa específica do usuário logado.
export const getUserParty = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [type, token] = (req.headers["authorization"] as string).split(" ");
    if (type !== "Bearer")
      return res.status(403).json({ error: "Não autorizado." });
    const user = (await getUserByToken(token, false)) as { _id: string };
    const party = await Party.findById({ _id: id, userId: user._id });
    if (!party)
      return res.status(400).json({ message: "Festa não encontrada!" });
    return res.status(200).json(party);
  } catch (err) {
    return res.status(400).json({ error: "Erro ao buscar festa." });
  }
};

//Pegar festas públicas e privadas de acordo com o usuário logado.
export const getPublicAndPrivateParties = async (
  req: Request,
  res: Response
) => {
  const [type, token] = (req.headers["authorization"] as string).split(" ");
  if (type !== "Bearer")
    return res.status(403).json({ error: "Não autorizado." });
  try {
    const user = (await getUserByToken(token, false)) as { _id: string };
    const parties = await Party.find({ privacy: false });
    const privateParties = await Party.find({
      userId: user._id,
      privacy: true,
    });
    if (parties.length === 0 && privateParties.length === 0)
      return res.json({ message: "Nenhuma festa encontrada!" });
    res.json({ parties, privateParties });
  } catch (err) {
    return res.status(401).json({ error: "Acesso Negado." });
  }
};

//Deletar a festa do usuário logado.
export const deleteParty = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [type, token] = (req.headers["authorization"] as string).split(" ");
    if (type !== "Bearer")
      return res.status(403).json({ error: "Não autorizado." });
    const user = (await getUserByToken(token, true)) as {
      _id: string;
      password: string;
    };
    if (!user) return res.status(403).json({ error: "Acesso negado!" });
    const party = await Party.findById({ _id: id, userId: user._id });
    if (!party) return res.status(400).json({ error: "Festa não encontrada!" });
    const { password } = req.body;
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword)
      return res.status(403).json({ error: "Acesso negado!" });
    if (party.photos) {
      party.photos.forEach((photo) => {
        let nomeFoto = photo
          .split(`${user._id}/`)[1]
          .split("%20")
          .join(" ")
          .split(`${party.title}/`)[1]
          .split(".webp")[0];
        cloudImg.uploader.destroy(
          `users/${user._id}/${party.title}/${nomeFoto}`,
          (err, result) => {
            if (err)
              return res.status(400).json({ error: "Erro ao deletar imagem!" });
            if (result) console.log(result);
          }
        );
      });
    }
    await party.delete();
    return res.status(200).json({ message: "Festa deletada com sucesso!" });
  } catch (err) {
    return res.status(403).json({ error: "Acesso negado." });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  if (req.file) {
    let image = sharp(req.file.path);
    const fileName = `${req.file.filename}.webp`;
    await image
      .resize(300, 300, {
        fit: "cover",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp()
      .toFile(`./public/assets/media/${fileName}`);
    unlinkSync(req.file.path);
    return fileName;
    // res.json({ image: `${fileName}` });
  } else {
    return res.status(404).json({ error: "Envie um arquivo válido." });
  }
};
