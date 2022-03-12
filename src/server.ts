import express, { ErrorRequestHandler, Request, Response } from "express";
import { mongoConnect } from "./instances/mongo";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { MulterError } from "multer";
import MainRoutes from "./routes";

dotenv.config(); //configura o dotenv
const server = express(); //inicia o express
server.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
); //habilita o cors
server.use(express.static(path.join(__dirname, "../public"))); //habilita o diretório public com o caminho absoluto
server.use(express.json()); //habilita o body-parser
server.use(express.urlencoded({ extended: true })); //habilita para receber dados do Post
mongoConnect(); //Conecta ao MongoDB

server.use(MainRoutes); //habilita as rotas

//Gerencia o erro de endpoint
server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Endpoint não encontrado." });
});

//Gerencia o erro de multer
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400);
  if (err instanceof MulterError) {
    console.log(err.code);
    res.json({ error: err.code });
  } else {
    console.log(err);
    res.json({ error: "Ocorreu algum erro." });
  }
};
server.use(errorHandler);

const PORT = process.env.PORT || 4000;
//Escuta na porta
server.listen(PORT, () => {
  console.log(`ESCUTANDO NA PORTA ${PORT}`);
});
