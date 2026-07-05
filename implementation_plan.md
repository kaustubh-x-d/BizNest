# Implementation Plan: PostgreSQL & PostGIS Database Schema, SQLAlchemy Models, and Alembic Migrations

This plan outlines the design and implementation of the database layer for BizNest. We will transition the backend to a Python-based stack (FastAPI/SQLAlchemy/Alembic) to match the SQLAlchemy/Alembic request.

## Proposed Database Architecture

We will use:
- **PostgreSQL 15+** with the **PostGIS** extension for spatial data operations.
- **SQLAlchemy 2.0** for Object-Relational Mapping (ORM).
- **GeoAlchemy2** to handle PostGIS geometry types (specifically `Geometry('POINT', srid=4326)`) in Python.
- **Alembic** for schema migrations.

### Schema Details

1. **`users`**:
   - `id`: UUID (Primary Key)
   - `email`: VARCHAR(255) (Unique, Indexed)
   - `password_hash`: VARCHAR(255)
   - `full_name`: VARCHAR(100)
   - `budget_tier`: VARCHAR(50) (Optional)
   - `created_at`: TIMESTAMP (with timezone)

2. **`business_configs`**:
   - `id`: UUID (Primary Key)
   - `business_type`: VARCHAR(100) (Unique)
   - `weights`: JSONB (Weight matrix for scoring)
   - `updated_at`: TIMESTAMP (with timezone)

3. **`search_histories`**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to `users.id` with cascade delete)
   - `search_query`: VARCHAR(255)
   - `location_coords`: Geometry(Point, srid=4326)
   - `business_type`: VARCHAR(100)
   - `budget`: NUMERIC(15, 2)
   - `searched_at`: TIMESTAMP (with timezone)

4. **`saved_reports`**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to `users.id` with cascade delete)
   - `title`: VARCHAR(255)
   - `location_coords`: Geometry(Point, srid=4326)
   - `business_type`: VARCHAR(100)
   - `budget`: NUMERIC(15, 2)
   - `score_breakdown`: JSONB (Transparent scoring components)
   - `recommendations`: JSONB (LLM outputs: pros, cons, suggestions)
   - `competitors_metadata`: JSONB (Competitors list details)
   - `created_at`: TIMESTAMP (with timezone)

5. **`competitor_caches`**:
   - `id`: UUID (Primary Key)
   - `osm_id`: VARCHAR(100) (Unique, Indexed)
   - `name`: VARCHAR(255)
   - `category`: VARCHAR(100)
   - `location_coords`: Geometry(Point, srid=4326)
   - `rating`: NUMERIC(2, 1) (Optional rating)
   - `additional_info`: JSONB (Any other properties)
   - `cached_at`: TIMESTAMP (with timezone)

### Indexes
- GIST spatial indexes on `location_coords` for `search_histories`, `saved_reports`, and `competitor_caches` to support high-performance radius searches.
- B-tree index on `users.email` and `competitor_caches.osm_id` for fast lookups.

---

## Proposed File Structure

We will create the following files under `backend/`:
- `backend/alembic.ini`: Alembic configurations.
- `backend/migrations/env.py`: Connection configuration mapping SQLAlchemy models to migration environment.
- `backend/migrations/script.py.mako`: Template file for Alembic.
- `backend/migrations/versions/xxxx_initial_migration.py`: Initial migration containing the creation of all tables, GIST indexes, and PostGIS requirements.
- `backend/app/db/base_class.py`: Base class for SQLAlchemy models.
- `backend/app/models/user.py`: SQLAlchemy Model for `users`.
- `backend/app/models/business_config.py`: SQLAlchemy Model for `business_configs`.
- `backend/app/models/search_history.py`: SQLAlchemy Model for `search_histories`.
- `backend/app/models/saved_report.py`: SQLAlchemy Model for `saved_reports`.
- `backend/app/models/competitor_cache.py`: SQLAlchemy Model for `competitor_caches`.
- `backend/app/models/__init__.py`: Registry file for importing all models so Alembic can discover them.

---

## Verification Plan

### Automated Verification
Since this is a design phase and we need to verify SQLAlchemy and Alembic schema generation, we will:
1. Ensure the SQLAlchemy models syntactically compile.
2. Validate the database schema DDL manually.
3. Validate that Alembic detects the schema and the migration script correctly targets the columns and indexes (including PostGIS features).
