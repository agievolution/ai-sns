"""Database session management and base configuration."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base class for ORM models
Base = declarative_base()

# Database path configuration
DBPath = os.path.join(Path(__file__).resolve().parent.parent.parent, "db", "db.sqlite")
print("DBPath", DBPath)
SQL_DATABASE_URL = fr"sqlite:///{DBPath}"

# Create engine
engine = create_engine(SQL_DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(bind=engine)


def get_session():
    """Get a new database session."""
    return SessionLocal()


def create_all_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(engine)
