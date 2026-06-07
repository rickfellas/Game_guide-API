## 📌 Visão Geral
O **Hub de Guias** é uma aplicação web Fullstack desenvolvida para permitir que a comunidade de jogadores crie, faça a gestão e partilhe guias, tutoriais e dicas de jogos (como *Resident Evil*, *Dark Souls*, *God of War*, entre outros). 

O projeto adota uma arquitetura de **Monólito**, onde o backend (Express) fornece a API REST e, simultaneamente, serve os ficheiros estáticos do frontend (React) no ambiente de produção na nuvem.

> **Contexto Acadêmico:** Este projeto foi desenvolvido como requisito prático para a disciplina de **Sistemas Distribuídos** do curso de Sistemas de Informação.

---

## ⚙️ Funcionalidades
- **Gestão de Catálogo (CRUD):** Registo, visualização e exclusão de jogos da biblioteca.
- **Gestão de Guias:** Criação de guias detalhados sob categorias específicas (Walkthrough, Loot, Conquistas, Modding), leitura e eliminação.
- **Feed da Comunidade:** Painel central que consolida os guias recentes de todos os jogos, com filtros dinâmicos de pesquisa (por texto, categoria e ano).
- **Sistema de Engajamento:** Votação (Upvotes/Downvotes) calculada em tempo real e secção de comentários em cada guia.
- **Exclusão em Cascata (Cascade Delete):** Lógica robusta de base de dados que garante a integridade relacional (ao apagar um jogo, os seus guias e comentários são removidos automaticamente).
- **Simulação de Painel de Autor:** Landing page com proteção visual indicando a gestão e propriedade do conteúdo por parte do utilizador.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)
