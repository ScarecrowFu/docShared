

def list_for_model_choices(value_list):
    # 将列表转为数据模型可用选项
    return ((value, value) for value in value_list)


def dict_for_model_choices(value_dict):
    # 将字典转换未数据模型可用选项
    return ((key, value) for key, value in value_dict.items())