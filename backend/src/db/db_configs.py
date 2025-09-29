from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession

from src.config import postgresql_db_conf

host = postgresql_db_conf().get('host')
user_name = postgresql_db_conf().get('userName')
password = postgresql_db_conf().get('password')
db_name = postgresql_db_conf().get('db_name')

DATABASE_URL = f"postgresql+psycopg://{user_name}:{password}@{host}/{db_name}"


# create SQLAlchemy engine and set connection pool for API call
async_engine = create_async_engine(
    DATABASE_URL,
    pool_size=8,
    max_overflow=2,
    pool_timeout=30,  # unit seconds
    pool_recycle=1800,  # unit seconds
)

AsyncSessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

