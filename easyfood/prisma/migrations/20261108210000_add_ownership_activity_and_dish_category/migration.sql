-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN "category" VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
