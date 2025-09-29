import json
import logging
import os

config = {}


def load_config():
    global config
    if len(config) > 0:
        return config
    root_path = os.path.dirname(os.path.abspath(__file__))
    config_path = root_path + "/config.json"
    if not os.path.exists(config_path):
        logging.error('don\'t have config.json, please create one')
        raise Exception('don\'t have config.json, please create one')

    config_str = read_file(config_path)
    # 将json字符串反序列化为dict类型
    config = json.loads(config_str)
    logging.info("Loading config: ")
    logging.info(config)
    return config


def read_file(path):
    with open(path, mode='r', encoding='utf-8') as f:
        return f.read()


def conf():
    return config


def project_conf():
    return config.get('project')


def postgresql_db_conf():
    return config.get('db').get('postgresql')


def auth_conf():
    return config.get("auth")


load_config()
