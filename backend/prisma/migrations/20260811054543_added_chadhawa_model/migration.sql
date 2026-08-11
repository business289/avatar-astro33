-- CreateTable
CREATE TABLE "chadhawas" (
    "id" TEXT NOT NULL,
    "temple_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "emoji" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chadhawas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chadhawas_temple_id_idx" ON "chadhawas"("temple_id");

-- CreateIndex
CREATE INDEX "chadhawas_temple_id_is_active_idx" ON "chadhawas"("temple_id", "is_active");

-- CreateIndex
CREATE INDEX "chadhawas_display_order_idx" ON "chadhawas"("display_order");

-- AddForeignKey
ALTER TABLE "chadhawas" ADD CONSTRAINT "chadhawas_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;
