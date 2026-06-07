import { Request, Response } from "express";
import { prisma } from "../models/Database";

// Busca os jogos direto do MySQL na nuvem
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' } 
    });
    res.json(games);
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Salva um jogo novo no banco de dados
export const createGame = async (req: Request, res: Response) => {
  try {
    const { title, franchise, releaseYear, isCompleted } = req.body;
    
    const newGame = await prisma.game.create({
      data: {
        title,
        franchise,
        releaseYear: Number(releaseYear),
        isCompleted: Boolean(isCompleted)
      }
    });
    
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Erro ao criar jogo:", error);
    res.status(500).json({ error: "Erro interno ao salvar no banco" });
  }
};

// Busca todos os guias de um jogo
export const getGuidesForGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const guides = await prisma.guide.findMany({
      where: { gameId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ guides });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar guias" });
  }
};

// Exclui um jogo e tudo que depende dele
// Exclui um jogo e tudo que depende dele em cascata
export const deleteGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Descobre todos os guias que pertencem a este jogo
    const guides = await prisma.guide.findMany({
      where: { gameId: id },
      select: { id: true }
    });
    
    // Extrai apenas as IDs desses guias
    const guideIds = guides.map(g => g.id);

    // 2. Apaga todos os comentários que pertencem a esses guias
    if (guideIds.length > 0) {
      await prisma.comment.deleteMany({
        where: { guideId: { in: guideIds } }
      });
    }

    // 3. Apaga os guias em si
    await prisma.guide.deleteMany({ 
      where: { gameId: id } 
    });
    
    // apaga o jogo raiz
    await prisma.game.delete({ 
      where: { id } 
    });
    
    res.json({ message: "Jogo excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir o jogo:", error);
    res.status(500).json({ error: "Erro ao excluir o jogo" });
  }
};