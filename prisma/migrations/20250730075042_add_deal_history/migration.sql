-- CreateTable
CREATE TABLE "DealHistory" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DealHistory" ADD CONSTRAINT "DealHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
