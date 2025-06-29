# Maven AI: AI-Powered Product Research Assistant, Data Driven Purchase

![Maven - Maven v2 Homepage](https://res.cloudinary.com/dberoyocy/image/upload/v1750684251/Maven-v2-Instagram-Poster_rj5bb1.png)

## See the Application showcases [Maven v2](https://maven-ai-webpage.vercel.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Maven** is a cutting-edge web application that leverages the power of Artificial Intelligence to revolutionize **electronic categorized product** research and decision-making. It provides users with a suite of tools to find, understand, and compare products, all within a streamlined and intuitive interface. Maven combines natural language processing, web scraping, external API integrations, and advanced AI models to deliver personalized recommendations, detailed product information, side-by-side comparisons, and insightful summaries.

## Desktop

[![Maven - Showcase Product Details](https://res.cloudinary.com/dberoyocy/image/upload/v1750163607/thumb-desktop-maven-d-lenovo-legion-9i_ntnul4.png)
](https://github.com/user-attachments/assets/1f08a59c-012e-4392-95ff-d87b25fe9c40)

![Maven - Product Details](https://res.cloudinary.com/dberoyocy/image/upload/v1750163609/raw-snapshot-product-details_vmyjfp.png)

## Mobile

![Maven Banner Mobile - 1](https://res.cloudinary.com/dberoyocy/image/upload/v1750163699/snapshot-mobile-search-product_koqckh.png)

![Maven Banner Mobile - 2](https://res.cloudinary.com/dberoyocy/image/upload/v1750163707/snapshot-mobile-product-comparison_fvnyrq.png)

## Table of Contents

- [Maven AI: AI-Powered Product Research Assistant, Data Driven Purchase](#maven-ai-ai-powered-product-research-assistant-data-driven-purchase)
  - [See the Application showcases Maven v2](#see-the-application-showcases-maven-v2)
  - [Desktop](#desktop)
  - [Mobile](#mobile)
  - [Table of Contents](#table-of-contents)
  - [1. Features ](#1-features-)
  - [2. Technology Stack ](#2-technology-stack-)
  - [4. Getting Started ](#4-getting-started-)
    - [4.1. Prerequisites ](#41-prerequisites-)
    - [4.2. Installation ](#42-installation-)
    - [4.3 SQL Table](#43-sql-table)
    - [4.3. Environment Variables ](#43-environment-variables-)
    - [4.4. Running the Application ](#44-running-the-application-)
  - [5. Usage ](#5-usage-)
    - [5.1. Basic Interaction ](#51-basic-interaction-)
    - [5.2. Agent Tools ](#52-agent-tools-)
      - [5.2.1. `recommendator` ](#521-recommendator-)
      - [5.2.2. `searchProduct` ](#522-searchproduct-)
      - [5.2.3. `getProductDetails` ](#523-getproductdetails-)
      - [5.2.4. `productsComparison` ](#524-productscomparison-)
      - [5.2.5. `inquireUser` ](#525-inquireuser-)
  - [6. Deployment ](#6-deployment-)
  - [7. Contributing ](#7-contributing-)
  - [8. License ](#8-license-)
  - [9. Troubleshooting ](#9-troubleshooting-)

## 1. Features <a name="features"></a>

Maven offers a comprehensive set of AI-powered features designed to assist users throughout the product research process:

- **Personalized Recommendations (`recommendator`):** Get product suggestions tailored to your specific needs and preferences. Maven analyzes your input and provides insightful explanations for each recommendation.
- **Precise Product Search (`searchProduct`):** Quickly find specific products using full or partial names. Maven retrieves relevant results and presents them with concise summaries.
- **In-Depth Product Details (`getProductDetails`):** Access comprehensive information about a product, including specifications, features, reviews, pricing, and availability. Maven gathers data from multiple sources, including web scraping and external APIs.
- **Side-by-Side Comparisons (`productsComparison`):** Compare two products directly, highlighting key differences and similarities. Maven provides AI-powered insights to help you evaluate the options.
- **Interactive Inquiry (`inquireUser`):** Maven proactively asks clarifying questions to ensure it fully understands your needs, leading to more accurate and personalized results.
- **Streamed Results:** Experience a responsive and interactive interface with results delivered progressively as they become available.
- **Related Queries:** Explore alternative products and refine your search with suggested related queries.
- **AI-Powered Insights:** Understand the reasoning behind recommendations and comparisons with concise, informative explanations.

## 2. Technology Stack <a name="technology-stack"></a>

Maven is built using a modern and robust technology stack:

- **Framework:** Next.js (React) - Provides server-side rendering, routing, and a component-based architecture.
- **Language:** TypeScript - Adds static typing to JavaScript, improving code quality and maintainability.
- **AI Models:**
  - Google Generative AI (Gemini) - Used for natural language processing, text generation, and object generation.
  - (Optional) Groq, xAI, DeepSeek - Alternative AI models for potential performance or feature enhancements.
- **Web Scraping:** Firecrawl - Used to extract data from web pages.
- **External APIs:**
  - Tavily - Used for enhanced search and information retrieval.
  - Serper - Alternative search API.
- **Database:**
  - Upstash Redis - Used for caching and session management.
  - Neon (PostgreSQL) - Used for persistent data storage (e.g., user accounts, chat history).
- **Authentication:** NextAuth.js - Handles user authentication with providers like GitHub and Google.
- **Styling:** Shadcn/UI, Tailwindcss, Sass.
- **Deployment:** Vercel.
- **State Management:** `ai/rsc` - For stream UI, managing AI and UI state.

## 4. Getting Started <a name="getting-started"></a>

### 4.1. Prerequisites <a name="prerequisites"></a>

Before you begin, ensure you have the following installed:

- **Node.js:** (v18 or later recommended) - JavaScript runtime environment.
- **NPM:** (or yarn, or pnpm) - Package manager for Node.js.
- **Git:** Version control system.
- **A code editor:** (VS Code, Sublime Text, Atom, etc.)

### 4.2. Installation <a name="installation"></a>

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/rizzzky78/market-maven
    cd market-maven
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    # or
    yarn install
    # or
    pnpm install
    ```

### 4.3 SQL Table

Paste bellow SQL query to create database table on Neon database SQL query editor:

- scrape_cache Table

```sql
CREATE TABLE scrape_cache (
    key UUID PRIMARY KEY,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add an index on query for faster lookups
CREATE INDEX idx_scrape_cache_query ON scrape_cache (query);
```

**Description:** Stores cached web scraping results with a UUID primary key. Each record contains a query string, JSON response data, and a timestamp. Designed for quick lookups of previously scraped content to avoid redundant web requests.

- markdown_store Table

```sql
CREATE TABLE markdown_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    markdown TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add indexes for faster lookups
CREATE INDEX idx_markdown_store_chat_id ON markdown_store (chat_id);
CREATE INDEX idx_markdown_store_owner ON markdown_store (owner);
```

**Description:** Stores markdown content with metadata. Used to persist formatted text content related to products or other entities. Each entry is identified by a unique key and associated with a specific chat and owner.

- object_store Table

```sql
CREATE TABLE object_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    object JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add indexes for faster lookups
CREATE INDEX idx_object_store_chat_id ON object_store (chat_id);
CREATE INDEX idx_object_store_owner ON object_store (owner);
```

**Description:** General-purpose object storage table that maintains structured JSON data. Supports different object types (like product searches, product details, etc.) and associates each object with a chat and owner.

- tool_data_store Table

```sql
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

-- Optional: Add indexes for faster lookups
CREATE INDEX idx_tool_data_store_chat_id ON tool_data_store (chat_id);
CREATE INDEX idx_tool_data_store_owner ON tool_data_store (owner);
```

**Description:** Records the results of tool operations with detailed tracking of success status. Stores both the input arguments and output data as JSON, making it useful for auditing and retrieving past tool executions.

- shares Table

```sql
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

-- Optional: Add indexes for faster lookups
CREATE INDEX idx_shares_reference_id ON shares (reference_id);
CREATE INDEX idx_shares_user_id ON shares (user_id);
CREATE INDEX idx_shares_component_type ON shares (component_type);
```

**Description:** Manages content sharing functionality. Tracks when components are shared, who shared them, access counts, and last access times. Supports analytics on sharing patterns across different component types.

### 4.3. Environment Variables <a name="environment-variables"></a>

Create a `.env.local` file in the root directory of the project and populate it with the necessary environment variables. **Do not commit this file to version control.** You'll need to obtain API keys and database credentials from the respective services.

```
LOG_LEVEL="info"

# Base URL search for Tokopedia (or other e-commerce site, if applicable)
TOKOPEDIA_SEARCH_BASE_URL="https://www.tokopedia.com/search?q="

# Models
# Google Generative AI API key retrieved here: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY="YOUR_APIKEY"

# Groq API key retrieved here: https://console.groq.com/keys
GROQ_API_KEY="YOUR_APIKEY"

XAI_API_KEY="YOUR_APIKEY"

DEEPSEEK_API_KEY="YOUR_APIKEY"

# External Sources API

# Tavily API Key retrieved here: https://app.tavily.com/home
TAVILY_API_KEY="YOUR_APIKEY"

# Serper API Key retrieved here: https://serper.dev/api-key
SERPER_API_KEY="YOUR_APIKEY"

FIRECRAWL_API_KEY="YOUR_APIKEY"

# Databases

# Upstash Redis URL and Token retrieved here: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL="YOUR_APIKEY"
UPSTASH_REDIS_REST_TOKEN="YOUR_APIKEY"

NEON_DATABASE_URL="YOUR_APIKEY" # PostgreSQL connection string

NEXTAUTH_SECRET="USE_SECURE_STRING_OR_RANDSSL" # Generate a strong secret
NEXTAUTH_URL=http://localhost:3000 # Update this for production

AUTH_GITHUB_ID="YOUR_GITHUB_AUTH_ID"
AUTH_GITHUB_SECRET="YOUR_GITHUB_AUTH_SECRET"

AUTH_GOOGLE_ID="YOUR_GOOGLE_AUTH_ID"
AUTH_GOOGLE_SECRET="YOUR_GOOGLE_AUTH_SECRET"

# Redis Configuration
USE_LOCAL_REDIS=false
LOCAL_REDIS_URL=redis://localhost:6379 # or redis://redis:6379 if you're using docker compose

# Must change when on production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes on Environment Variables:**

- **Security:** Never commit your `.env.local` file to version control. It contains sensitive API keys and credentials.
- **API Keys:** You'll need to sign up for accounts with the various services (Google Generative AI, Groq, Tavily, Serper, Firecrawl, Upstash Redis, Neon) to obtain API keys.
- **Database URLs:** The `NEON_DATABASE_URL` is a PostgreSQL connection string. You'll need to set up a PostgreSQL database (e.g., using Neon) and obtain the connection string.
- **Authentication:** You'll need to configure authentication providers (GitHub, Google) and obtain client IDs and secrets.
- `NEXTAUTH_SECRET`: Use openssl to generate it. `openssl rand -base64 32`
- **`NEXT_PUBLIC_APP_URL`:** Change this to your production URL when deploying.

### 4.4. Running the Application <a name="running-the-application"></a>

1.  **Start the development server:**

    ```bash
    bun run dev
    # or
    yarn dev
    # or
    pbun dev
    ```

2.  **Open your browser and navigate to `http://localhost:3000`** (or the URL indicated in the console).

## 5. Usage <a name="usage"></a>

### 5.1. Basic Interaction <a name="basic-interaction"></a>

The primary interface for interacting with Maven is a chat-like input field. You can:

- **Type text queries:** Ask questions or make requests related to products.
- **Interact with prompts:** Respond to clarifying questions from Maven.
- **Attach Product:** Send existing product to get recommendation based on it.
- **Compare Product:** Compare two products.

Maven will process your input and respond with relevant information, recommendations, or comparisons. The results are streamed, meaning you'll see information appear as it becomes available.

### 5.2. Agent Tools <a name="agent-tools"></a>

Maven utilizes a set of AI-powered agent tools to fulfill user requests. These tools are automatically selected by the orchestrator based on the user's intent.

#### 5.2.1. `recommendator` <a name="recommendator"></a>

![Recommendator](https://res.cloudinary.com/dberoyocy/image/upload/v1750924600/short-Desktop-Maven-Recommendator_yjvs2m.gif)

- **Purpose:** Provides personalized product recommendations.
- **Input:** A text query describing your needs and preferences (e.g., "best noise-canceling headphones for travel under $200").
- **Output:** A list of recommended products, along with AI-powered insights explaining the recommendations.
- **Example:**
  ```
  User: I need a new laptop for graphic design and video editing. My budget is around $2000.
  Maven: (Provides a list of recommended laptops with insights)
  ```

#### 5.2.2. `searchProduct` <a name="searchproduct"></a>

![Search](https://res.cloudinary.com/dberoyocy/image/upload/v1750923473/short-Maven-Search-Q-Legion9i_tzdckp.gif)

- **Purpose:** Finds specific products based on their names (full or partial).
- **Input:** The full or partial name of the product (e.g., "Sony WH-1000XM5", "WH-1000XM").
- **Output:** A list of matching products, with concise summaries and links to more details.
- **Example:**
  ```
  User: Samsung Galaxy S23 Ultra
  Maven: (Provides search results for the Samsung Galaxy S23 Ultra)
  ```

#### 5.2.3. `getProductDetails` <a name="getproductdetails"></a>

![Details](https://res.cloudinary.com/dberoyocy/image/upload/v1750924389/short-Maven-Details-D-Legion9i_ytimp5.gif)

- **Purpose:** Retrieves comprehensive information about a specific product.
- **Input:** The product name or a link to the product page.
- **Output:** Detailed product specifications, features, reviews, pricing, and availability information, along with AI-powered insights.
- **Example:**
  ```
  User: Attach selected product on UI and submit message attach product or along with text inputs
  Maven: (Provides detailed information about the iPhone 15 Pro plus insight)
  ```

#### 5.2.4. `productsComparison` <a name="productscomparison"></a>

![Comparison](https://res.cloudinary.com/dberoyocy/image/upload/v1750924481/short-Maven-Comparison-Rog-G16-Legion-9I_gqra3n.gif)

- **Purpose:** Compares two products side-by-side.
- **Input:** The `callId` values of two products (obtained after using `getProductDetails` on each product).
- **Output:** A comparison table highlighting key differences and similarities, along with AI-powered insights.
- **Example:**
  ```
  User: Compare callId: a1b2c3d4 and callId: e5f6g7h8  (These are example IDs)
  Maven: (Provides a comparison table and insights)
  ```
  **Important:** You _must_ use `getProductDetails` on each product _before_ you can compare them. This provides Maven with the necessary data.

#### 5.2.5. `inquireUser` <a name="inquireuser"></a>

![Inquiry](https://res.cloudinary.com/dberoyocy/image/upload/v1750924619/short-Desktop-Maven-User-Inquiry_u1kelp.gif)

- **Purpose:** Asks clarifying questions to ensure Maven fully understands your needs.
- **Input:** An ambiguous or incomplete user query.
- **Output:** A clarifying question presented to the user.
- **Example:**
  ```
  User: Find me a good laptop.
  Maven: What will you primarily use the laptop for? (Work/Productivity, Gaming, Creative Tasks, General Use, Other)
  ```

## 6. Deployment <a name="deployment"></a>

Deployment instructions will vary depending on your chosen platform (Vercel, Netlify, AWS, etc.). General steps include:

1.  **Set up a production database:** Configure your PostgreSQL database (e.g., on Neon) and Upstash Redis instance for production use.
2.  **Configure environment variables:** Set the appropriate environment variables on your deployment platform (including API keys and database credentials). **Do not commit sensitive information to your Git repository.**
3.  **Build the application:** Run `bun run build` (or the equivalent command for your package manager) to create a production build.
4.  **Deploy:** Follow the deployment instructions for your chosen platform.

## 7. Contributing <a name="contributing"></a>

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your branch to your forked repository.
5.  Submit a pull request to the main repository.

## 8. License <a name="license"></a>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 9. Troubleshooting <a name="troubleshooting"></a>

- **App isn't starting:**
  - Double check all environment variables, especially database connection strings and API keys.
  - Ensure all required services (PostgreSQL, Redis) are running and accessible.
  - Look for error messages in the console.
- **Features not working as expected:**
  - Review the Usage section of this README.
  - Check the browser's developer console for errors.
  - Ensure you have the correct API keys and that they are configured correctly.
- **Authentication issues:**
  - Verify your authentication provider settings (GitHub, Google) are correct.
  - Ensure `NEXTAUTH_URL` is set correctly for your environment.
- **Database connection problems:**
  - Double-check your database connection strings in `.env.local`.
  - Ensure your database server is running and accessible.
  - Verify that your database user has the necessary permissions.
