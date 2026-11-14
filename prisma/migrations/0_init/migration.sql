-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "message_role" AS ENUM ('user', 'assistant', 'system', 'tool');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(6),
    "refresh_token_expires_at" TIMESTAMPTZ(6),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "scrape_cache" (
    "key" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrape_cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "markdown_store" (
    "key" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markdown_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "object_store" (
    "key" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "object" JSONB NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "object_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "tool_data_store" (
    "key" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "tool_success" BOOLEAN NOT NULL,
    "tool_name" TEXT NOT NULL,
    "tool_args" JSONB NOT NULL,
    "tool_data" JSONB NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_data_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "base_url" TEXT,
    "api_key_cipher" TEXT NOT NULL,
    "api_key_hint" TEXT NOT NULL,
    "structured_outputs" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_model_assignments" (
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "max_output_tokens" INTEGER,
    "reasoning" TEXT,

    CONSTRAINT "ai_model_assignments_pkey" PRIMARY KEY ("user_id","role")
);

-- CreateTable
CREATE TABLE "ai_preferences" (
    "user_id" TEXT NOT NULL,
    "instructions" TEXT,
    "style" TEXT NOT NULL DEFAULT 'balanced',
    "tone" TEXT NOT NULL DEFAULT 'neutral',
    "language" TEXT,
    "depth" TEXT NOT NULL DEFAULT 'standard',
    "priorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currency" TEXT,
    "budget_max" INTEGER,
    "track_usage" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT,
    "role" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "reasoning_tokens" INTEGER NOT NULL DEFAULT 0,
    "cached_tokens" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_accounts_user_id" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "idx_verifications_identifier" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "idx_chats_user_id_updated_at" ON "chats"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_scrape_cache_query" ON "scrape_cache"("query");

-- CreateIndex
CREATE INDEX "idx_markdown_store_chat_id" ON "markdown_store"("chat_id");

-- CreateIndex
CREATE INDEX "idx_markdown_store_owner" ON "markdown_store"("owner");

-- CreateIndex
CREATE INDEX "idx_object_store_chat_id" ON "object_store"("chat_id");

-- CreateIndex
CREATE INDEX "idx_object_store_owner" ON "object_store"("owner");

-- CreateIndex
CREATE INDEX "idx_tool_data_store_chat_id" ON "tool_data_store"("chat_id");

-- CreateIndex
CREATE INDEX "idx_tool_data_store_owner" ON "tool_data_store"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "shares_reference_id_key" ON "shares"("reference_id");

-- CreateIndex
CREATE INDEX "idx_shares_reference_id" ON "shares"("reference_id");

-- CreateIndex
CREATE INDEX "idx_shares_user_id" ON "shares"("user_id");

-- CreateIndex
CREATE INDEX "idx_shares_component_type" ON "shares"("component_type");

-- CreateIndex
CREATE INDEX "idx_ai_connections_user_id" ON "ai_connections"("user_id");

-- CreateIndex
CREATE INDEX "idx_ai_model_assignments_connection_id" ON "ai_model_assignments"("connection_id");

-- CreateIndex
CREATE INDEX "idx_ai_usage_user_id_created_at" ON "ai_usage"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markdown_store" ADD CONSTRAINT "markdown_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_store" ADD CONSTRAINT "object_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_data_store" ADD CONSTRAINT "tool_data_store_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_connections" ADD CONSTRAINT "ai_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_model_assignments" ADD CONSTRAINT "ai_model_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_model_assignments" ADD CONSTRAINT "ai_model_assignments_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "ai_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_preferences" ADD CONSTRAINT "ai_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
