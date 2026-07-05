from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    # pool_pre_ping checks the connection health before executing commands
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
