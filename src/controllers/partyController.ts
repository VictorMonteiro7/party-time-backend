import { Request, Response } from "express";
import Party from "../models/Party";
import { getUserById } from "../helpers/getUserById";
import User from "../models/User";

export const postParty = async (req: Request, res: Response) => {
  const [type, token] = (req.headers["authorization"] as string).split(" ");
  if (type !== "Bearer")
    return res.status(403).json({ error: "Não autorizado." });
  try {
    let photos: string[] = [];
    let files = req.files as { [fieldname: string]: Express.Multer.File[] };
    files.photos.forEach((photo) => {
      photos.push(photo.filename);
    });
    const { title, description, date, privacy } = req.body;
    if (!title || !description || !date)
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    const user = (await getUserById(token, false)) as { _id: string };
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
    res.status(400).json({ error: "Erro ao criar a festa" });
    return;
  }
};

export const getUserParties = async (req: Request, res: Response) => {
  const [type, token] = (req.headers["authorization"] as string).split(" ");
  if (type !== "Bearer")
    return res.status(403).json({ error: "Não autorizado." });
  try {
    const conf = (await getUserById(token, false)) as { _id: string };
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

export const getUserParty = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [type, token] = (req.headers["authorization"] as string).split(" ");
    if (type !== "Bearer")
      return res.status(403).json({ error: "Não autorizado." });
    const user = (await getUserById(token, false)) as { _id: string };
    const party = await Party.findById({ _id: id, userId: user._id });
    return res.status(200).json(party);
  } catch (err) {
    return res.status(400).json({ error: "Erro ao buscar festa." });
  }
};
