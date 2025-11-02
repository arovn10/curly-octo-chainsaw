import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const base = new PrismaClient();

export const prisma =
  process.env.PRISMA_ACCELERATE_URL
    ? base.$extends(withAccelerate())
    : base;
