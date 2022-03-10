import { getUserById } from "./../helpers/getUserById";
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import validator from "validator";
dotenv.config();

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

export const getUser = async (req: Request, res: Response) => {
  const [type, token] = (req.headers.authorization as string).split(" ");
  if (type !== "Bearer")
    return res.status(400).json({ error: "Token inválido" });
  try {
    const user = await getUserById(token, false);
    res.status(200).json(user);
    return;
  } catch (err) {
    console.log("ERRO ", err);
    res.status(400).json({ error: "Erro ao buscar usuário" });
    return;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const [type, token] = (req.headers.authorization as string).split(" ");
  if (type !== "Bearer")
    return res.status(400).json({ error: "Token inválido" });
  try {
    const user = await getUserById(token, true);
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
