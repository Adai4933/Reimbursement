import logging

from sqlalchemy import create_engine

from src.db.modals.base_db import Base
from src.db.db_configs import DATABASE_URL


def init_db():
    # create synchronous engine for initialize
    sync_engine = create_engine(DATABASE_URL)

    logging.info("Initializing database and creating all tables if not exist...")
    # create all table if not exist
    Base.metadata.create_all(bind=sync_engine)
    logging.info("Database initialization completed.")

    # close engine after database change
    sync_engine.dispose()
