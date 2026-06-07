import { Router } from "express";
import { createGuide, getGuideDetails, voteGuide, addComment , getRecentGuides, deleteGuide } from "../controllers/guideController";
//import { authMiddleware } from "../middlewares/authMiddleware"; // <-- IMPORTA O MIDDLEWARE

const router = Router();

// Rota pública: qualquer um pode ler os detalhes de um guia
router.get("/:id", getGuideDetails);
router.get("/", getRecentGuides);

// Rotas protegidas: só passa se tiver o Token JWT válido!  - JWT desativado
router.get("/", getRecentGuides);
router.get("/:id", getGuideDetails);
router.post("/", createGuide);
router.post("/:id/vote", voteGuide);
router.post("/:id/comments", addComment);
router.delete("/:id", deleteGuide); // <-- Nova rota de exclusão!

export default router;