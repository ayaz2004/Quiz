-- CreateTable
CREATE TABLE "housing_listings" (
    "listing_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "listing_type" VARCHAR(20) NOT NULL,
    "university" VARCHAR(20) NOT NULL DEFAULT 'JMI',
    "gender_preference" VARCHAR(20) NOT NULL DEFAULT 'female',
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "area" VARCHAR(100),
    "maps_url" VARCHAR(500),
    "rent_monthly" DOUBLE PRECISION,
    "fee_notes" TEXT,
    "entry_timing" VARCHAR(200),
    "meals" TEXT,
    "visitors" TEXT,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "images" JSONB NOT NULL DEFAULT '[]',
    "contact_phone" VARCHAR(20) NOT NULL,
    "whatsapp_number" VARCHAR(20),
    "availability" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending_review',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "contact_reveal_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "housing_listings_pkey" PRIMARY KEY ("listing_id")
);

-- CreateIndex
CREATE INDEX "housing_listings_status_idx" ON "housing_listings"("status");

-- CreateIndex
CREATE INDEX "housing_listings_user_id_idx" ON "housing_listings"("user_id");

-- CreateIndex
CREATE INDEX "housing_listings_university_idx" ON "housing_listings"("university");

-- CreateIndex
CREATE INDEX "housing_listings_listing_type_idx" ON "housing_listings"("listing_type");

-- CreateIndex
CREATE INDEX "housing_listings_created_at_idx" ON "housing_listings"("created_at");

-- AddForeignKey
ALTER TABLE "housing_listings" ADD CONSTRAINT "housing_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
