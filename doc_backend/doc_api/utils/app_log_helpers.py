"""
系統日志记录
"""
import os
from loguru import logger
from doc_api.utils.base_helpers import create_or_get_directory


def make_filter(name):

    def filter_record(record):
        return record["extra"].get("name") == name

    return filter_record


base_log_path = '/tmp/docShared'
base_log_path = create_or_get_directory(base_log_path)

api_log_path = os.path.join(base_log_path, 'docShared_api.log')
task_log_path = os.path.join(base_log_path, 'docShared_task.log')

logger.add(api_log_path, level="DEBUG", filter=make_filter("api"))
logger.add(task_log_path, level="DEBUG", filter=make_filter("task"))

api_logger = logger.bind(name="api")
task_logger = logger.bind(name="task")
