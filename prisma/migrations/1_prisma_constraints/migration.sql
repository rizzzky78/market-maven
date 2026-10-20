-- Align the baseline tables with prisma/schema.prisma: timestamps and the
-- share access counter become NOT NULL. Rows written before relied on column
-- defaults, so any NULLs are backfilled first.

UPDATE "scrape_cache" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "markdown_store" SET "timestamp" = CURRENT_TIMESTAMP WHERE "timestamp" IS NULL;
UPDATE "object_store" SET "timestamp" = CURRENT_TIMESTAMP WHERE "timestamp" IS NULL;
UPDATE "tool_data_store" SET "timestamp" = CURRENT_TIMESTAMP WHERE "timestamp" IS NULL;
UPDATE "shares" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "shares" SET "last_accessed_at" = CURRENT_TIMESTAMP WHERE "last_accessed_at" IS NULL;
UPDATE "shares" SET "access_count" = 0 WHERE "access_count" IS NULL;
UPDATE "ratings" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;

-- AlterTable
ALTER TABLE "scrape_cache" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "markdown_store" ALTER COLUMN "timestamp" SET NOT NULL;

-- AlterTable
ALTER TABLE "object_store" ALTER COLUMN "timestamp" SET NOT NULL;

-- AlterTable
ALTER TABLE "tool_data_store" ALTER COLUMN "timestamp" SET NOT NULL;

-- AlterTable
ALTER TABLE "shares" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "last_accessed_at" SET NOT NULL,
ALTER COLUMN "access_count" SET NOT NULL;

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "created_at" SET NOT NULL;
