CREATE TABLE "scholarship_category_links" (
    "scholarship_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "scholarship_category_links_pkey" PRIMARY KEY ("scholarship_id","category_id")
);

CREATE INDEX "scholarship_category_links_category_id_idx" ON "scholarship_category_links"("category_id");

ALTER TABLE "scholarship_category_links" ADD CONSTRAINT "scholarship_category_links_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("scholarship_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scholarship_category_links" ADD CONSTRAINT "scholarship_category_links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "scholarship_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "scholarship_category_links" ("scholarship_id", "category_id")
SELECT "scholarship_id", "category_id"
FROM "scholarships"
WHERE "category_id" IS NOT NULL;

INSERT INTO "scholarship_categories" ("label", "created_at", "updated_at")
SELECT 'PhD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "scholarship_categories" WHERE "label" = 'PhD'
);

ALTER TABLE "scholarships" DROP CONSTRAINT "scholarships_category_id_fkey";

DROP INDEX "scholarships_category_id_idx";

ALTER TABLE "scholarships" DROP COLUMN "category_id";
