import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from models import Base

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if not DATABASE_URL:
    _db_path = os.path.join(os.path.dirname(__file__), "party_planner.db")
    DATABASE_URL = f"sqlite:///{_db_path}"

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _ensure_column(conn, table, column, ddl_type):
    """Add a column to an existing table if it's missing. Works on Postgres and SQLite."""
    insp = inspect(conn)
    existing = {c["name"] for c in insp.get_columns(table)}
    if column not in existing:
        conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {ddl_type}'))


def init_db():
    Base.metadata.create_all(bind=engine)
    # Lightweight migrations for columns added after initial deploy
    with engine.begin() as conn:
        if "recipes" in inspect(conn).get_table_names():
            _ensure_column(conn, "recipes", "prep_time_minutes", "INTEGER NOT NULL DEFAULT 0")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
