-- Chats move from Redis to PostgreSQL: chats + chat_messages, and the tool,
-- object and markdown stores now reference their chat (cascade on delete).

-- CreateEnum
CREATE TYPE "message_role" AS ENUM ('user', 'assistant', 'system', 'tool');

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "chat_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "message_id" TEXT NOT NULL,
    "role" "message_role" NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("chat_id","position")
);

-- CreateIndex
CREATE INDEX "idx_chats_user_id_updated_at" ON "chats"("user_id", "updated_at" DESC);

-- Backfill: tool, object and markdown rows written while chats lived in Redis
-- reference chat ids that have no row yet. Create a placeholder chat per id
-- (owner from the records, no messages, title generated on next save) so the
-- foreign keys below can be added.
INSERT INTO "chats" ("id", "user_id", "created_at", "updated_at")
SELECT "chat_id", MIN("owner"), MIN("ts"), MAX("ts")
FROM (
    SELECT "chat_id", "owner", "timestamp" AS "ts" FROM "tool_data_store"
    UNION ALL
    SELECT "chat_id", "owner", "timestamp" FROM "object_store"
    UNION ALL
    SELECT "chat_id", "owner", "timestamp" FROM "markdown_store"
) AS "records"
GROUP BY "chat_id"
ON CONFLICT ("id") DO NOTHING;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markdown_store" ADD CONSTRAINT "markdown_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_store" ADD CONSTRAINT "object_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_data_store" ADD CONSTRAINT "tool_data_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

