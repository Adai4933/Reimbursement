import logging

from fastapi.middleware.cors import CORSMiddleware

from src.config import conf


def add_cors_middleware(app, origins=None):
    if origins is None:
        origins = conf().get("origins_whitelist", [])

    if len(origins) == 0:
        logging.warning("CORS origins list is empty. No origins are allowed.")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],  # 可以指定所需 HTTP 方法，比如 ['GET', 'POST']
        allow_headers=["*"],  # 可以指定所需头部信息
    )
