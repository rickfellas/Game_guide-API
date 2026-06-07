import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import guideRoutes from "./src/routes/guideRoutes";
import gameRoutes from "./src/routes/gameRoutes";

async function startServer() {
  const app = express();
  
  // CORREÇÃO: O Railway fala  qual será a porta através do process.env.PORT
  const PORT = process.env.PORT || 3000;

  // Middleware para parsear JSON
  app.use(express.json());

  // Rotas da API
  app.use("/api/guides", guideRoutes);
  app.use("/api/games", gameRoutes);

  // Fallback API para evitar que requisições não encontradas vão pro fallback do Vite
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "Endpoint não encontrado" });
  });

  // Integrando o Vite como middleware para ambiente de desenvolvimento --.> desistência
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Modo de produção: serve os arquivos estáticos do React
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Escutando na porta dinâmica
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();