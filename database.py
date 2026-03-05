import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nourishnet.db")


engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialise database schema for local development.

    In production, prefer running Alembic migrations instead.
    """
    # Import models so that they are registered with SQLAlchemy metadata
    import models.monetization  # noqa: F401

    Base.metadata.create_all(bind=engine)

