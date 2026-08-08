-- AlterTable
ALTER TABLE "products" ADD COLUMN "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
ADD COLUMN "review_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 1;

-- Backfill ratings and review counts from reviews table
UPDATE "products" p
SET "average_rating" = COALESCE(r.avg_rating, 5.0),
    "review_count" = COALESCE(r.rev_count, 0)
FROM (
    SELECT "product_id", AVG(rating) AS avg_rating, COUNT(*) AS rev_count
    FROM "reviews"
    GROUP BY "product_id"
) r
WHERE p.id = r.product_id;
