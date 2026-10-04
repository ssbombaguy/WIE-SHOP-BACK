-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionKa" TEXT;

-- CreateTable
CREATE TABLE "BundleItem" (
    "productId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("productId","itemId")
);

-- CreateIndex
CREATE INDEX "BundleItem_itemId_idx" ON "BundleItem"("itemId");

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
