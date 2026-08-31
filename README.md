# Personalized Career PathFinder
# Local Setup & Execution Instructions

## 1. Prerequisites

The following tools and versions are required:

-   **Node.js:** v24.19.0 (v20+ supported)
-   **npm:** v11.17.0
-   **Python:** v3.10.0 (3.10+ supported)
-   **Git**

## 2. Clone the Repository

``` bash
git clone https://github.com/mithunbs05/Personalized-Career-PathFinder.git
cd Personalized-Career-PathFinder
```

## 3. Supabase Database & Auth Configuration

This project uses **Supabase** for PostgreSQL database management, authentication, and secure profile/roadmap persistence.

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/) and click **New Project**.
2. Set your Project Name and Database Password, then create the project.
3. Once created, navigate to **Project Settings -> API** to retrieve:
   - **Project URL** (`SUPABASE_URL` / `VITE_SUPABASE_URL`)
   - **anon / public key** (`VITE_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)
4. In **Project Settings -> Database**, copy the **Connection string (URI)** for `DATABASE_URL`.

### Step 2: Run Database Schema & Migrations
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Copy and paste the contents of `supabase/005_connected_system_schema.sql` (or `supabase/schema.sql`).
4. Click **Run** to generate the unified tables (`users`, `profiles`, `roadmaps`, `mentor_sessions`, `mentor_assessments`, etc.), Row Level Security (RLS) policies, and automatic user profile creation triggers.

### Step 3: Configure Authentication
1. Go to **Authentication -> Providers** and verify that **Email** is enabled.
2. Under **Authentication -> URL Configuration**, set:
   - **Site URL**: `http://localhost:3000` (or your live Vercel URL)
   - **Redirect URLs**: Add `http://localhost:3000/**` and `https://<your-app>.vercel.app/**`

---

## 4. Backend Setup & Execution

The backend is built using **FastAPI, LangChain, PostgreSQL/Supabase, and OpenAI**.

### Install Dependencies

Navigate to the backend directory:

``` bash
cd backend
```

Install the required Python dependencies:

``` bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file in the `backend/` directory by copying
`.env_example`:

``` bash
cp .env_example .env
```

Update the `.env` file with the required credentials:

``` env
# Supabase & Database Configuration
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>

# Backend Configuration
PORT=8000

# AI Configuration
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_API_BASE_URL=https://api.openai.com/v1

# YouTube API Configuration
YOUTUBE_API_KEY=<your-youtube-api-v3-key>
```

### Start the Backend Server

Run the FastAPI development server:

``` bash
uvicorn app.main:app --reload
```

The backend API will be available at:

-   **Backend API:** `http://localhost:8000`
-   **Swagger API Documentation:** `http://localhost:8000/docs`
-   **ReDoc API Documentation:** `http://localhost:8000/redoc`

## 5. Frontend Setup & Execution

The frontend is built using **React 19, Vite, and Express**.

Open a **new terminal** and navigate to the frontend directory:

``` bash
cd frontend
```

Install the Node.js dependencies:

``` bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the `frontend/` directory based on
`.env.example`:

``` env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Start the Frontend Application

Run the development server:

``` bash
npm run dev
```

## 6. Access the Application

Once both the backend and frontend servers are running:

-   **Web Application:** `http://localhost:3000`
-   **Backend API:** `http://localhost:8000`
-   **Backend Swagger Documentation:** `http://localhost:8000/docs`

## 7. Important Notes

-   Start the backend server before using frontend features that depend
    on the API.
-   Ensure that Supabase/PostgreSQL and all required API credentials are
    configured correctly.
-   Keep API keys and service-role credentials private.
-   Do not commit `.env` files or other secrets to Git.
-   The `backend/.env_example` and `frontend/.env.example` files can be
    used as templates for the required environment variables.
