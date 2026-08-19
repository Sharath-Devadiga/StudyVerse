ALTER TABLE "Resource" ADD COLUMN "publicId" TEXT;
ALTER TABLE "Resource" ADD COLUMN "sizeBytes" INTEGER;
CREATE TABLE "StudySummary" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "lastMessageId" TEXT,
  "lastResourceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudySummary_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudySummary_roomId_channelId_key" ON "StudySummary"("roomId", "channelId");
CREATE INDEX "StudySummary_channelId_updatedAt_idx" ON "StudySummary"("channelId", "updatedAt");
ALTER TABLE "StudySummary" ADD CONSTRAINT "StudySummary_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
