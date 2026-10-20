-- Baseline: the tables the app created before adopting Prisma (previously
-- documented in the README). Existing databases mark this migration as
-- applied with `prisma migrate resolve --applied 0_init`.

CREATE TABLE scrape_cache (
    key UUID PRIMARY KEY,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_scrape_cache_query ON scrape_cache (query);

CREATE TABLE markdown_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    markdown TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_markdown_store_chat_id ON markdown_store (chat_id);
CREATE INDEX idx_markdown_store_owner ON markdown_store (owner);

CREATE TABLE object_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    object JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_object_store_chat_id ON object_store (chat_id);
CREATE INDEX idx_object_store_owner ON object_store (owner);

CREATE TABLE tool_data_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    tool_success BOOLEAN NOT NULL,
    tool_name TEXT NOT NULL,
    tool_args JSONB NOT NULL,
    tool_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tool_data_store_chat_id ON tool_data_store (chat_id);
CREATE INDEX idx_tool_data_store_owner ON tool_data_store (owner);

CREATE TABLE shares (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    reference_id TEXT UNIQUE NOT NULL,
    component_id TEXT NOT NULL,
    component_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0
);
CREATE INDEX idx_shares_reference_id ON shares (reference_id);
CREATE INDEX idx_shares_user_id ON shares (user_id);
CREATE INDEX idx_shares_component_type ON shares (component_type);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
