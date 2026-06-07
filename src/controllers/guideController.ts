import { Request, Response } from "express";
import { prisma } from "../models/Database";

export const createGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId, title, content, category, tags } = req.body;
    const userId = "JogadorLocal"; // Fixo, pois tiramos a autenticação

    if (!gameId) {
      res.status(400).json({ error: "É necessário selecionar um jogo para criar o guia." });
      return;
    }

    const newGuide = await prisma.guide.create({
      data: {
        gameId,
        userId,
        title,
        content,
        category,
        tags: tags || [],
      }
    });

    res.status(201).json({ message: "Guia criado com sucesso!", guide: newGuide });
  } catch (error) {
    console.error("Erro ao criar guia:", error);
    res.status(500).json({ error: "Erro interno ao salvar o guia." });
  }
};

export const getGuideDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Atualiza as views (+1) e já busca os comentários atrelados
    const guide = await prisma.guide.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: { comments: true } 
    });

    res.json({ guide, comments: guide.comments });
  } catch (error) {
    res.status(404).json({ error: "Guia não encontrado." });
  }
};

export const voteGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    const incrementValue = voteType === "upvote" ? 1 : -1;

    const guide = await prisma.guide.update({
      where: { id },
      data: { rating: { increment: incrementValue } }
    });

    res.json({ message: "Voto registrado!", rating: guide.rating });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar o voto." });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, userId } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        guideId: id,
        userId,
        content
      }
    });

    res.status(201).json({ message: "Comentário adicionado!", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar comentário." });
  }
};

// Busca os guias mais recentes de todos os jogos para o Feed da Home
export const getRecentGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: { createdAt: 'desc' }, // Traz os mais novos primeiro
      take: 20, // Limita aos 20 mais recentes para não pesar a tela inicial
      include: { 
        game: true // Pulo do gato: traz o título e ano do jogo junto com o guia!
      }
    });

    res.json({ guides });
  } catch (error) {
    console.error("Erro ao buscar guias recentes:", error);
    res.status(500).json({ error: "Erro interno ao carregar o feed." });
  }
};
// Exclui um guia e seus comentários
export const deleteGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.comment.deleteMany({ where: { guideId: id } });
    await prisma.guide.delete({ where: { id } });
    
    res.json({ message: "Guia excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir o guia" });
  }
};