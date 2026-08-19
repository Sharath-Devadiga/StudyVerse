ALTER TABLE "Message" ADD COLUMN "resourceId" TEXT;
CREATE UNIQUE INDEX "Message_resourceId_key" ON "Message"("resourceId");
ALTER TABLE "Message" ADD CONSTRAINT "Message_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
