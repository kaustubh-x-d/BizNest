# BizNest Platform
> "Predict the potential before you invest."

BizNest is an AI-powered Business Intelligence and Decision Support Platform that helps first-time entrepreneurs decide where to open a new business. By analyzing location parameters using geographic GIS data, demographic indices, accessibility, and competition density, BizNest calculates a mathematical **Business Potential Score** and generates rich AI recommendations.

Kanpur, Uttar Pradesh, India is the primary demo city, supplemented with real OpenStreetMap datasets.

---

## 🛠️ System Architecture

BizNest uses a decoupled **Client-Server** architecture:
* **Frontend**: React (TypeScript) + Tailwind CSS + Recharts + Leaflet Maps.
* **Backend**: FastAPI (Python 3.11) + SQLAlchemy (PostgreSQL + PostGIS spatial indexing).
* **AI Model**: Gemini (`gemini-1.5-flash`) for metric rationale explanations (Pros, Cons, suggestions).

---

## ⚡ Local Quickstart

### Prerequisites
* Python 3.11+
* Node.js 20+
* PostgreSQL with PostGIS extension (or a Supabase connection string)

### 1. Database Setup (Supabase / Postgres)
Create a PostgreSQL database and enable the PostGIS spatial extensions:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Backend Installation
1. Navigate to `/backend` directory.
2. Create a `.env` file:
   ```env
   POSTGRES_SERVER=localhost
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgrespassword
   POSTGRES_DB=biznest
   POSTGRES_PORT=5432
   SECRET_KEY=yoursecretjwtkey
   REFRESH_SECRET_KEY=yourrefreshsecretjwtkey
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
3. Install dependencies and run server:
   ```bash
   pip install -r requirements.txt
   uvicorn backend.app.main:app --reload
   ```
   * *Swagger Documentation* available at: `http://localhost:8000/docs`

### 3. Frontend Installation
1. Navigate to `/frontend` directory.
2. Install packages and start dev server:
   ```bash
   npm install
   npm run dev
   ```
   * *Local Web Panel* running at: `http://localhost:5173`

---

## 🐳 Running with Docker Compose

To orchestrate the full stack locally (including PostgreSQL + PostGIS DB):
1. In the root directory, create a `.env` file containing your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_value
   ```
2. Start the Docker containers:
   ```bash
   docker-compose up --build
   ```
3. Open:
   * **Web UI**: `http://localhost:3000`
   * **API Docs**: `http://localhost:8000/docs`

---

## 🚀 Cloud Deployment Guides

### 1. Database (Supabase)
1. Register on [Supabase](https://supabase.com/).
2. Create a new project.
3. Retrieve your Transaction Pool Connection String under **Project Settings > Database > Connection Strings**.
4. Use this connection string in your Render Backend environment configurations (`DATABASE_URL`).

### 2. Backend (Render)
BizNest is pre-configured with a Render Blueprint file (`render.yaml`).
1. Connect your repository to Render.
2. Create a new blueprint using `render.yaml`.
3. Set your custom `GEMINI_API_KEY` under backend service environment variables.

### 3. Frontend (Vercel)
Vercel handles static Single Page App React routing via `vercel.json` configurations.
1. Connect your repository to Vercel.
2. Import the `frontend` subfolder.
3. Configure the environment variable `VITE_API_URL` pointing to your deployed Render FastAPI service url.
4. Deploy!
