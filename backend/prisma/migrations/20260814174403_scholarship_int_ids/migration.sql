-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('PUBLISHED', 'UNPUBLISHED');

-- CreateTable
CREATE TABLE "scholarship_categories" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "scholarship_id" SERIAL NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "about" TEXT,
    "category_id" INTEGER,
    "amount" VARCHAR(255),
    "deadline" TIMESTAMP(3),
    "apply_url" TEXT,
    "eligibility" JSONB,
    "documents" JSONB,
    "steps" JSONB,
    "important_info" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("scholarship_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_slug_key" ON "scholarships"("slug");

-- CreateIndex
CREATE INDEX "scholarships_status_idx" ON "scholarships"("status");

-- CreateIndex
CREATE INDEX "scholarships_category_id_idx" ON "scholarships"("category_id");

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "scholarship_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
