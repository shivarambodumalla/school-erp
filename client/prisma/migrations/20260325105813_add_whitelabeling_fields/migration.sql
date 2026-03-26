-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TRAINING_CENTER');

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "darkPalette" JSONB,
ADD COLUMN     "emailHeader" TEXT,
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "institutionType" "InstitutionType" NOT NULL DEFAULT 'SCHOOL',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "studentCapacity" INTEGER,
ADD COLUMN     "themeAppliedAt" TIMESTAMP(3),
ADD COLUMN     "themePalette" JSONB,
ADD COLUMN     "website" TEXT;
