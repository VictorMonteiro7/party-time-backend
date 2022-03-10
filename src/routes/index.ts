import { checkToken } from "./../middlewares/checkToken";
import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as PartyController from "../controllers/partyController";
import { upload } from "../helpers/fileStorage";

const router = Router();

router.post("/register", UserController.newUser);
router.post("/login", UserController.loginUser);

router.get("/user/", checkToken, UserController.getUser);
router.put("/user/", checkToken, UserController.updateUser);
router.get("/user/parties", checkToken, PartyController.getUserParties);
router.get("/user/party/:id", checkToken, PartyController.getUserParty);

router.post(
  "/party",
  [checkToken, upload.fields([{ name: "photos", maxCount: 5 }])],
  PartyController.postParty
);

router.get("/parties", PartyController.getParties);
export default router;
