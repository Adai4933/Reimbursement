import logging

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from src.config import project_conf
from src.controller.file_controller import file_router
from src.router.router_config import add_cors_middleware
from src.controller.user_controller import user_router
from src.controller.ticket_controller import ticket_router
from src.db.db_generator import init_db


def create_application() -> FastAPI:
    """
    创建 FastAPI 应用实例
    """
    application = FastAPI(
        title=project_conf().get("project_name", "FastAPI Application"),
        version=project_conf().get("version"),
    )

    add_cors_middleware(application)

    application.mount("/static", StaticFiles(directory=project_conf().get("static_files_path")), name="static")

    # 包含路由

    application.include_router(user_router)
    application.include_router(ticket_router)
    application.include_router(file_router)

    init_db()

    logging.basicConfig(level=logging.ERROR)

    return application


app = create_application()

