import { getUserByToken } from "../helpers/getUserByToken";
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import validator from "validator";
import Party from "../models/Party";
import fs from "fs";
dotenv.config();

//Novo Usuário
export const newUser = async (req: Request, res: Response) => {
  let { name, email, password } = req.body;
  if (name && email && password) {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido." });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Crie uma senha forte." });
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ error: "Usuário já existe" });
      return;
    }
    const salt = await bcrypt.genSalt(+(process.env.PASS_BUFFER as string));
    password = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password,
    });
    try {
      await newUser.save();
      //gera o token
      const token = JWT.sign(
        { id: newUser._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).json({ token, id: newUser._id });
    } catch (err) {
      res.status(400).json({ error: "Erro ao criar usuário" });
      return;
    }
  } else {
    res.status(400).json({ error: "Dados inválidos!" });
  }
};

//Login
export const loginUser = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  if (email && password) {
    const user = await User.findOne({ email });
    if (user) {
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        //Retorna erro se a senha não for igual
        res.status(400).json({ error: "Senha inválida" });
        return;
      }
      //gera o token
      const token = JWT.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).json({ token, id: user._id });
    }
  } else {
    res.status(400).json({ error: "Insira todos os dados" });
  }
};

//Pegar usuário
export const getUser = async (req: Request, res: Response) => {
  const [type, token] = (req.headers.authorization as string).split(" ");
  if (type !== "Bearer")
    return res.status(400).json({ error: "Token inválido" });
  try {
    const user = await getUserByToken(token, false);
    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(400).json({ error: "Erro ao buscar usuário" });
    return;
  }
};

//Atualizar o usuário
export const updateUser = async (req: Request, res: Response) => {
  const [type, token] = (req.headers.authorization as string).split(" ");
  if (type !== "Bearer")
    return res.status(400).json({ error: "Token inválido" });
  try {
    const user = await getUserByToken(token, true);
    if (user !== null) {
      const { name, email, password, oldPass } = req.body;
      if (!oldPass)
        return res.status(400).json({ error: "Senha antiga não informada" });
      const comparePassword = await bcrypt.compare(oldPass, user.password);
      if (!comparePassword)
        return res.status(403).json({ error: "Senha antiga inválida" });
      if (name || email || password) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
          const salt = await bcrypt.genSalt(
            +(process.env.PASS_BUFFER as string)
          );
          user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.status(200).json({
          message: "Dados atualizados com sucesso!",
          id: user._id,
          name: user.name,
          email: user.email,
        });
        return;
      } else {
        res.status(401).json({ error: "Nenhum dado trocado" });
      }
    } else {
      res.status(400).json({ error: "Usuário não encontrado" });
    }
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar usuário" });
    return;
  }
};

//excluir o usuário
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [type, token] = (req.headers.authorization as string).split(" ");
    if (type !== "Bearer")
      return res.status(400).json({ error: "Token inválido" });
    const user = (await getUserByToken(token, true)) as {
      _id: string;
      password: string;
    };
    const { password } = req.body;
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword)
      return res.status(403).json({ error: "Acesso negado!" });
    const sameUser = (await User.findOne({ _id: id })) as { _id: string };
    if (sameUser._id.toString() === user._id.toString()) {
      const userParties = await Party.find({ userId: user._id });
      userParties.forEach((party: { [key: string]: any }) => {
        party.photos.forEach((photo: string) => {
          fs.unlinkSync(`./tmp/${photo}`);
        });
        party.delete();
      });
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } else {
      return res.status(403).json({ error: "Acesso negado!" });
    }
  } catch (err) {
    return res.status(403).json({ error: "Acesso negado!" });
  }
};
