import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
export const mongoConnect = async () => {
  console.log("Conectando ao mongoDB");
  try {
    await mongoose.connect(process.env.MG_DB as string);
    console.log("Conectado ao mongoDB");
  } catch (err) {
    console.log("Erro ao conectar ao mongoDB", err);
  }
};
//conecta ao banco de dados
