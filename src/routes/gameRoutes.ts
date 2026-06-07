import { Router } from "express";
import { getGuidesForGame, getAllGames, createGame, deleteGame } from "../controllers/gameController";

const router = Router();

router.get("/", getAllGames);
router.post("/", createGame); // <-- A Rota para salvar os jogos!
router.get("/:gameId/guides", getGuidesForGame);
router.get("/:id", deleteGame); 
export default router;