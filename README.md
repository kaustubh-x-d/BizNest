# BizNest

BizNest is an AI-assisted business intelligence platform that helps entrepreneurs evaluate potential locations before starting a business.

The platform combines geospatial information, nearby business analysis, configurable business scoring, and AI-generated recommendations to support location-based business decisions.

Rather than acting as another map application, BizNest is designed as a decision support tool that helps answer questions such as:

- Is this a good place to open a café?
- How competitive is this area?
- Which nearby location offers better potential?
- What factors reduce the viability of this location?
- How can the business potential be improved?

The current implementation focuses on a hackathon MVP while keeping the architecture modular enough for future expansion.

Kanpur, Uttar Pradesh, India is the primary demo city, supplemented with real OpenStreetMap datasets.

---

## Features

### Business Potential Analysis

- Business Potential Score
- Transparent score breakdown
- Business-specific scoring logic
- Explainable recommendations

### Business Types

The current MVP supports:

- Café
- Bakery
- Pharmacy
- Gym
- Kirana Store

Each business type uses its own scoring configuration rather than a single universal formula.

### Interactive Map

- OpenStreetMap integration
- Location search
- Nearby business discovery
- Competitor visualization
- Radius-based analysis

### Competition Analysis

- Nearby competitors
- Business density
- Distance calculations
- Category analysis

### AI Recommendation Engine

The recommendation engine explains:

- Strengths of a location
- Weaknesses
- Potential risks
- Suggested improvements

The AI is intentionally **not** responsible for generating the Business Potential Score. It only interprets and explains the results produced by the scoring engine.

### Business Comparison

Users can compare two locations based on:

- Business Potential Score
- Market demand
- Competition
- Accessibility
- Investment feasibility
- Growth potential

### Reports

Generate downloadable reports containing:

- Score summary
- Business analysis
- Recommendations
- Comparison results

---

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- React Query
- Leaflet
- Recharts

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication

### Database

- PostgreSQL
- PostGIS

### GIS

- OpenStreetMap
- Overpass API
- Nominatim API

### AI

- OpenAI-compatible LLM
- Prompt-based recommendation generation

---

## Project Structure

```
frontend/
backend/
database/
docs/
```

Frontend contains the user interface.

Backend contains APIs, authentication, business logic, and AI integration.

Database contains migrations and models.

---

## Data Sources

The project uses publicly available data wherever possible.

Primary sources include:

- OpenStreetMap
- Overpass API
- Nominatim
- Government Open Data
- Census datasets

Some business metrics such as estimated footfall, commercial activity, or rental estimates are currently represented using curated demonstration data where reliable public datasets are unavailable.

---

## Design Philosophy

A key design decision in BizNest is separating **decision logic** from **language generation**.

The Business Potential Score is calculated using configurable business rules.

The language model does not assign scores.

Instead, it explains:

- why a location received a particular score
- what risks exist
- how the score could potentially be improved

This makes recommendations easier to understand while keeping the scoring process transparent.

---

## Future Improvements

Potential future work includes:

- Support for additional cities
- Live traffic integration
- Commercial real estate data
- Revenue forecasting
- Government scheme recommendations
- Multi-language support
- Franchise planning
- Customer demographic analysis
- Weather-aware business insights

---

##  System Architecture

BizNest uses a decoupled **Client-Server** architecture:
* **Frontend**: React (TypeScript) + Tailwind CSS + Recharts + Leaflet Maps.
* **Backend**: FastAPI (Python 3.11) + SQLAlchemy (PostgreSQL + PostGIS spatial indexing).
* **AI Model**: Gemini (`gemini-1.5-flash`) for metric rationale explanations (Pros, Cons, suggestions).

---

##  Local Quickstart

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

##  Running with Docker Compose

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

##  Cloud Deployment Guides

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


## Project Status

Current Status:

Hackathon MVP

The project demonstrates the core workflow and architecture while leaving room for future improvements and production-level enhancements.

---

## AI Usage Disclosure

AI was used extensively during the development of this project.

Rather than treating AI as a code generator alone, it was used as an engineering assistant for:

- exploring architectural alternatives
- generating implementation scaffolding
- accelerating repetitive development tasks
- refining documentation
- debugging
- brainstorming product features

Final implementation decisions, feature prioritization, system integration, testing, debugging, and customization were performed manually.

The purpose of using AI was to increase development speed while maintaining an understanding of the system architecture and implementation.

---

## License

This project is intended for educational and demonstration purposes.
