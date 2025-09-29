import hashlib
import datetime
import jwt

from src.config import auth_conf
from src.db.modals.user import User
from src.service import user_service

# auth constants
SECRET_KEY = auth_conf().get("auth_secret_key")
ALGORITHM = 'HS256'


# encrypt password using sha256
def sha256_encrypt(password):
    return hashlib.sha256(password.encode()).hexdigest()


# token encode and decode, todo add redis as token cache to validate expire time
def encode_auth_token(user_id, password, login_time, expire=24):
    payload = {
        'iss': 'ken',  # 签名
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, hours=expire),  # 过期时间
        'iat': datetime.datetime.utcnow(),  # 开始时间
        'data': {
            'id': user_id,
            'password': password,
            'login_time': login_time
        }
    }
    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return token


def decode_auth_token(auth_token):
    payload = jwt.decode(auth_token, SECRET_KEY, algorithms=ALGORITHM, options={'verify_exp': False})
    if 'data' in payload and 'id' in payload['data'] and 'password' in payload['data']:
        return payload
    else:
        raise jwt.InvalidTokenError


def validate_token(token):
    try:
        payload = decode_auth_token(token)
        user_id = payload['data']['id']
        password = payload['data']['password']
        user = user_service.login(user_id, password)
        if isinstance(user, User):
            return payload
        else:
            return False
    except Exception as e:
        raise e
