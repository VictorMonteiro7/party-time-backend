import { checkToken } from "./../middlewares/checkToken";
import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as PartyController from "../controllers/partyController";
import { upload } from "../helpers/fileStorage";

const router = Router();

router.post("/register", UserController.newUser); //Rota de Registro (Pública)
router.post("/login", UserController.loginUser); //Rota de Login (Pública)

router.get("/user/", checkToken, UserController.getUser); //Rota para pegar informações do usuário
router.put("/user/", checkToken, UserController.updateUser); //Rota para atualizar o usuário
router.get("/user/private-parties", checkToken, PartyController.getUserParties); //Rota para pegar as festas do usuário
router.get("/user/party/:id", checkToken, PartyController.getUserParty); //Rota para pegar uma festa específica do usuário

router.post(
  "/party",
  [checkToken, upload.fields([{ name: "photos", maxCount: 5 }])],
  PartyController.postParty
); //Rota para criar uma nova festa
router.delete("/user/party/:id", checkToken, PartyController.deleteParty); //Rota para deletar uma festa'

//rotas de festas públicas

router.get("/user/parties", PartyController.getPublicAndPrivateParties); //Rota para pegar as festas públicas e privadas (se a privada for do usuário).
router.get("/parties", PartyController.getParties); //Rota pública para pegar festas
export default router;
