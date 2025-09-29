from datetime import datetime

from sqlalchemy import select, and_

from src.db.db_configs import get_db
from src.db.db_enum import UserGroup
from src.db.modals.user import User
from src.utils.auth import sha256_encrypt, decode_auth_token


async def login(email: str, password: str) -> User | None:
    async for db in get_db():
        result = await db.execute(
            select(User).where(User.email == email, User.password == sha256_encrypt(password))
        )
        user = result.scalar_one_or_none()
        return user


async def is_email_existing(email: str) -> bool:
    async for db in get_db():
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        return user is not None


async def get_user_by_id (id: int) -> User | None:
    async for db in get_db():
        query = select(User).where(and_(User.id == id, User.deleted == 0))
        result = await db.execute(query)
        return result.scalar_one_or_none()


async def get_user_id_from_token(token):
    if token.startswith("Bearer "):
        token = token[7:]
    token_obj = decode_auth_token(token)
    user_id = token_obj.get("data").get("id") if token_obj and token_obj.get("data") else None
    return user_id


async def register(username: str, email: str, password: str, group: str) -> User:
    new_user = User(
        username=username,
        email=email,
        password=sha256_encrypt(password),
        group=UserGroup.get_name(group),
        created_time=datetime.now(),
        updated_time=datetime.now(),
    )

    try:
        async for db in get_db():
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user
    except Exception as e:
        raise e


async def list_users(user_id: int) -> list[User]:
    async for db in get_db():
        try:
            result = await db.execute(
                select(User).where(and_(User.id == user_id, User.deleted == 0))
            )
            user = result.scalar_one_or_none()
            if user.group != UserGroup.EMPLOYER:
                raise PermissionError("Not enough permissions")

            result = await db.execute(
                select(User).order_by(User.deleted.asc(), User.id.desc())
            )
            users = result.scalars().all()
            return users
        except Exception as e:
            raise e


async def suspend_user(suspend_user_id: int, deleted: bool) -> User:
    async for db in get_db():
        try:
            result = await db.execute(
                select(User).where(and_(User.id == suspend_user_id))
            )
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not exist")
            user.deleted = deleted
            user.updated_time = datetime.now()
            await db.commit()
            await db.refresh(user)
            return user
        except Exception as e:
            raise e
