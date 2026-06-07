import { PrismaClient } from '@prisma/client';

// Inicia a conexão real com o banco de dados
export const prisma = new PrismaClient();