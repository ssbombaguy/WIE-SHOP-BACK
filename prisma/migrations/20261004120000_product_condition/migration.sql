-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'REFURBISHED', 'USED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "condition" "Condition" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "Product_condition_idx" ON "Product"("condition");
