from doc_api.models import ActionLog
from datetime import datetime
import json
from doc_api.utils.app_log_helpers import api_logger


def model_to_dic(instance):
    if instance:
        _instance = {}
        # 当前模型除了多对多的所有字段
        for field in instance._meta.fields:
            field_name = field.name
            key = getattr(field, '_verbose_name', field_name)
            value = getattr(instance, field_name, None)
            if isinstance(value, datetime):
                value = value.strftime('%Y-%m-%d %H:%M:%S')
            _instance[key] = str(value)
        return _instance
    return {}


def diff_model_instance(old_instance=None, instance=None):
    # 将模型转化为字典
    old_instance = model_to_dic(old_instance)
    instance = model_to_dic(instance)
    fields = old_instance.keys() if old_instance else instance.keys()
    # 对比两个对象差异
    change = dict()
    for field in fields:
        if field in ['password', 'last login']:
            continue
        old_value = old_instance.get(field)
        new_value = instance.get(field)
        if old_value != new_value:
            change[field] = [old_value, new_value]
    try:
        change = json.dumps(change, ensure_ascii=False)
    except Exception as e:
        api_logger.error(f'diff_model_instance json.dumps err ->', e)
        api_logger.error(f'diff_model_instance changes ->', change)
        change = {}
    return change


def get_remote_ip(request):
    if request is not None:
        x_real_ip = request.META.get('HTTP_X_REAL_IP')
        if x_real_ip:
            remote_ip = x_real_ip.split(',')[0]
        else:
            http_remote_ip = request.META.get('HTTP_REMOTE_ADDR')
            if http_remote_ip:
                remote_ip = http_remote_ip.split(',')[0]
            else:
                remote_ip = request.META.get('REMOTE_ADDR')
    else:
        remote_ip = None
    return remote_ip


def action_log(request, user, action_type, old_instance=None, instance=None, action_info="", object_changes=None):
    api_logger.debug(f'request :{request}')
    api_logger.debug(f'user :{user}')
    api_logger.debug(f'action_type :{action_type}')
    api_logger.debug(f'old_instance :{old_instance}')
    api_logger.debug(f'instance :{instance}')
    api_logger.debug(f'action_info :{action_info}')
    api_logger.debug(f'object_changes :{object_changes}')

    try:
        # 取出操作请求，从其中得到ip地址
        remote_ip = get_remote_ip(request)
        api_logger.debug(f'remote_ip :{remote_ip}')
        # 如果instance存在日记记录对象为instance，否则为old_instance
        content_object = instance if instance else old_instance
        if old_instance and instance:
            object_changes = diff_model_instance(old_instance, instance)
        api_logger.debug(f'changes :{object_changes}')
        ActionLog.objects.create(content_object=content_object, user=user, action_type=action_type,
                                 action_info=action_info,
                                 object_changes=object_changes, remote_ip=remote_ip)
    except Exception as error:
        api_logger.error("日志记录过程中发生错误, 具体错误:{}".format(error))
