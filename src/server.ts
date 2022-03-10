import express, { ErrorRequestHandler, Request, Response } from "express";
import { mongoConnect } from "./instances/mongo";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { MulterError } from "multer";
import MainRoutes from "./routes";

dotenv.config(); //configura o dotenv
const server = express(); //inicia o express
server.use(cors()); //habilita o cors
server.use(express.static(path.join(__dirname, "../public"))); //habilita o diretório public com o caminho absoluto
server.use(express.urlencoded({ extended: true })); //habilita para receber dados do Post
mongoConnect();
//Faz o ping teste para o endpoint /ping
server.use("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

server.use(MainRoutes); //habilita as rotas

//Gerenciar o erro
server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Endpoint não encontrado." });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400); // Bad Request
  if (err instanceof MulterError) {
    console.log(err.code);
    res.json({ error: "Ocorreu algum erro" });
  } else {
    console.log(err);
    res.json({ error: "Ocorreu algum erro." });
  }
};
server.use(errorHandler);

//Escutar na porta
server.listen(process.env.PORT);
