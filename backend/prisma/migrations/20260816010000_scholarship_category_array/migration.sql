ALTER TABLE "scholarships" ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "scholarships" AS s
SET "categories" = COALESCE((
    SELECT ARRAY_AGG(c."label" ORDER BY c."id")
    FROM "scholarship_category_links" AS l
    INNER JOIN "scholarship_categories" AS c ON c."id" = l."category_id"
    WHERE l."scholarship_id" = s."scholarship_id"
), ARRAY[]::TEXT[]);

DROP TABLE "scholarship_category_links";
