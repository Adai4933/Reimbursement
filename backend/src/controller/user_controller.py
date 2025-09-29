import logging
import time

from fastapi import HTTPException, Request, APIRouter
from fastapi.params import Body
from fastapi.responses import JSONResponse

from src.common.business_error_code import ErrorCode
from src.common.validation import is_valid_email, is_valid_password, is_valid_username
from src.db.modals.user import User
from src.db.db_enum import UserGroup
from src.service import user_service
from src.utils import auth
from src.service.user_service import is_email_existing, get_user_id_from_token
from src.utils.datetime import format_datetime_to_minute

user_router = APIRouter(prefix="/api")


@user_router.post("/login")
async def login(data: dict = Body(...)):
    email = data.get('email', '')
    password = data.get('password', '')
    current_user = await user_service.login(email, password)

    # invalid user
    if not isinstance(current_user, User):
        logging.error(f"Login failed for email: {email} - invalid credentials.")
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid email or password", "success": False, "error_code": ErrorCode.invalid_parameter}
        )
    token = auth.encode_auth_token(current_user.id, current_user.password,
                                   time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
    return JSONResponse(
        status_code=200,
        content={
            "data": {
                "username": current_user.username,
                "email": current_user.email,
                "group": current_user.group.name,
                "token": token
            },
            "success": True
        }
    )


@user_router.post("/register")
async def register(data: dict = Body(...)):
    email = data.get('email', '')
    password = data.get('password', '')
    username = data.get('username', '')
    group = data.get('group', UserGroup.EMPLOYEE.name)

    if not (is_valid_email(email) and is_valid_password(password) and is_valid_username(username)):
        logging.error(f"Invalid registration data: email={email}, username={username}.")
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid register data", "success": False, "error_code": ErrorCode.invalid_parameter}
        )

    if await is_email_existing(email):
        logging.error(f"Registration failed: Email {email} already registered.")
        raise HTTPException(
            status_code=400,
            detail={"error": "Email already registered", "success": False, "error_code": ErrorCode.email_exist}
        )

    current_user = await user_service.register(username, email, password, group)
    if isinstance(current_user, User):
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "username": current_user.username,
                    "email": current_user.email,
                    "group": current_user.group.name
                },
                "success": True
            }
        )

    logging.error(f"Registration failed for email: {email} - database insertion error.")
    raise HTTPException(
        status_code=500,
        detail={"error": "Registration failed", "success": False, "error_code": ErrorCode.db_insert_error}
    )


@user_router.get("/user/list")
async def list_users(request: Request = None):
    token = request.headers.get("Authorization")
    user_id = await get_user_id_from_token(token)

    if not user_id:
        logging.error("Invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token", "success": False, "error_code": ErrorCode.invalid_token}
        )

    users = await user_service.list_users(user_id)

    if not isinstance(users, list):
        logging.error(f"Failed to query user list for user_id: {user_id}.")
        raise HTTPException(
            status_code=500,
            detail={"error": "Query user list failed", "success": False, "error_code": ErrorCode.db_query_error}
        )

    if len(users) == 0:
        return JSONResponse(
            status_code=200,
            content={
                "data": [],
                "success": True
            }
        )

    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.group.name,
            "suspended": user.deleted,
            "createdAt": format_datetime_to_minute(user.created_time)
        } for user in users
    ]

    return JSONResponse(
        status_code=200,
        content={
            "data": user_list,
            "success": True
        }
    )


@user_router.put("/user/suspend")
async def suspend_user(data: dict = Body(...), request: Request = None):
    suspend_user_id = data.get('user_id')
    deleted = data.get('suspended')

    token = request.headers.get("Authorization")
    user_id = await get_user_id_from_token(token)

    if not user_id:
        logging.error("Invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token", "success": False, "error_code": ErrorCode.invalid_token}
        )

    # may need suspend reason in future

    current_user = await user_service.suspend_user(suspend_user_id, deleted)

    if isinstance(current_user, User):
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "username": current_user.username,
                    "email": current_user.email,
                    "group": current_user.group.name
                },
                "success": True
            }
        )

    logging.error(f"Suspend failed for id: {suspend_user_id} - database update error.")
    raise HTTPException(
        status_code=500,
        detail={"error": "Suspend user failed", "success": False, "error_code": ErrorCode.db_update_error}
    )
