# 🎮 Hub de Guias (Game Guide API)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

## 📌 Visão Geral
O **Hub de Guias** é uma aplicação web Fullstack desenvolvida para permitir que a comunidade de jogadores crie, faça a gestão e partilhe guias, tutoriais e dicas de jogos (como *Resident Evil*, *Dark Souls*, *God of War*, entre outros). 

O projeto adota uma arquitetura de **Monólito**, onde o backend (Express) fornece a API REST e, simultaneamente, serve os ficheiros estáticos do frontend (React) no ambiente de produção na nuvem.

> **Contexto Académico:** Este projeto foi desenvolvido como requisito prático para a disciplina de **Sistemas Distribuídos** do curso de Sistemas de Informação.

---

## ⚙️ Funcionalidades
- **Gestão de Catálogo (CRUD):** Registo, visualização e exclusão de jogos da biblioteca.
- **Gestão de Guias:** Criação de guias detalhados sob categorias específicas (Walkthrough, Loot, Conquistas, Modding), leitura e eliminação.
- **Feed da Comunidade:** Painel central que consolida os guias recentes de todos os jogos, com filtros dinâmicos de pesquisa (por texto, categoria e ano).
- **Sistema de Engajamento:** Votação (Upvotes/Downvotes) calculada em tempo real e secção de comentários em cada guia.
- **Exclusão em Cascata (Cascade Delete):** Lógica robusta de base de dados que garante a integridade relacional (ao apagar um jogo, os seus guias e comentários são removidos automaticamente).
- **Simulação de Painel de Autor:** Landing page com proteção visual indicando a gestão e propriedade do conteúdo por parte do utilizador.

---

## 🗄️ Modelação da Base de Dados
A base de dados relacional é composta por três entidades principais com relacionamento em cascata (1:N):
1. **Game (Jogo):** `id`, `title`, `franchise`, `releaseYear`, `isCompleted`.
2. **Guide (Guia):** `id`, `title`, `content`, `category`, `tags`, `rating`, `views`, `gameId`.
3. **Comment (Comentário):** `id`, `userId`, `content`, `guideId`.

---

## 📡 Endpoints da API REST

### 🕹️ Jogos (`/api/games`)
- `GET /` - Retorna o catálogo completo de jogos.
- `POST /` - Regista um novo jogo.
- `GET /:id/guides` - Retorna todos os guias associados a um jogo.
- `DELETE /:id` - Elimina um jogo e todo o seu conteúdo dependente.

### 📖 Guias (`/api/guides`)
- `GET /` - Retorna o feed global com os guias mais recentes (limite: 20).
- `POST /` - Publica um novo guia num jogo específico.
- `GET /:id` - Retorna os detalhes de um guia e os seus comentários.
- `POST /:id/vote` - Regista um voto positivo ou negativo.
- `POST /:id/comments` - Adiciona um novo comentário.
- `DELETE /:id` - Elimina um guia e os seus comentários.

---

## 🚀 Arquitetura e Deploy (Produção)
A aplicação está otimizada para integração contínua (CI/CD) e deploy na plataforma **Railway**.
- **Deploy Híbrido:** O comando de build compila o frontend (`vite build`) e gera o cliente Prisma (`prisma generate`).
- **Roteamento Unificado:** O `server.ts` identifica o ambiente (`NODE_ENV=production`) e serve a pasta `/dist` na raiz, reservando o prefixo `/api/*` para consumo de dados.
- **Injeção de Variáveis:** O acesso à base de dados MySQL é feito através de variáveis de ambiente dinâmicas (`${{ MySQL.MYSQL_URL }}`), garantindo tolerância a falhas na infraestrutura, e a comunicação externa aceita tráfego global com bind dinâmico de portas.

---

## 💻 Como Executar Localmente

**1. Clone o repositório:**
```bash
git clone (https://github.com/rickfellas/Game_guide-API)
cd Game_guide-API

2. Instale as dependências:
--> npm install

3. Configure as Variáveis de Ambiente:
Crie um ficheiro .env na raiz do projeto e insira a string de conexão da sua base de dados MySQL local:
--> DATABASE_URL="mysql://usuario:senha@localhost:3306/game_guide" 

4. Prepare a Base de Dados:
--> px prisma db push
--> npx prisma generate

npm run dev


👨‍💻 Autores

Estudadntes de Sistemas de informação: Flávio Kalyff e Rykelme Souza