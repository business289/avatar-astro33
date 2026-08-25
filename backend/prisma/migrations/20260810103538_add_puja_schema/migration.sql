-- CreateTable
CREATE TABLE "temples" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "deity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_from" INTEGER NOT NULL,
    "gradient" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "temples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temple_images" (
    "id" TEXT NOT NULL,
    "temple_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temple_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pujas" (
    "id" TEXT NOT NULL,
    "temple_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "benefits" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pujas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temples_slug_key" ON "temples"("slug");

-- CreateIndex
CREATE INDEX "temples_name_idx" ON "temples"("name");

-- CreateIndex
CREATE INDEX "temples_state_idx" ON "temples"("state");

-- CreateIndex
CREATE INDEX "temple_images_temple_id_idx" ON "temple_images"("temple_id");

-- CreateIndex
CREATE INDEX "pujas_temple_id_idx" ON "pujas"("temple_id");

-- AddForeignKey
ALTER TABLE "temple_images" ADD CONSTRAINT "temple_images_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pujas" ADD CONSTRAINT "pujas_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;
