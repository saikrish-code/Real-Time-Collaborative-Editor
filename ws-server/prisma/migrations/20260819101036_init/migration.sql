-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "room_id" TEXT NOT NULL,
    "ydoc_state" BYTEA NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_room_id_key" ON "documents"("room_id");
