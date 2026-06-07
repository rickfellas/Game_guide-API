import express from "express";
import path from "path";
import guideRoutes from "./src/routes/guideRoutes";
import gameRoutes from "./src/routes/gameRoutes";
// Note que o import do Vite SUMIU daqui de cima!

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Middleware para parsear JSON
  app.use(express.json());

  // Rotas da API
  app.use("/api/guides", guideRoutes);
  app.use("/api/games", gameRoutes);

  // Fallback API para evitar que requisições não encontradas vão pro fallback do Vite
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "Endpoint não encontrado" });
  });

  // Integrando o Vite dinamicamente APENAS se não for produção
  if (process.env.NODE_ENV !== "production") {
    // Importação dinâmica: o Node só tenta carregar o Vite se chegar nesta linha
    const vite = await import("vite");
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteServer.middlewares);
  } else {
    // Modo de produção: serve os arquivos estáticos do React
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();