from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import ForeignKey, ManyToManyField
from doc_api.utils.base_helpers import check_model_field


class BaseParameterFilter(DjangoFilterBackend):
    def get_valid_query_parameters(self, request, view):
        # 获取filterset_fields指定的有效字段
        filterset_fields = getattr(view, 'filterset_fields', None)
        parameters = request.query_params
        return {key: value for key, value in parameters.items() if key in filterset_fields or
                key.replace('min_', '') in filterset_fields or key.replace('max_', '') in filterset_fields}

    def change_field_to_valid(self, model, field, value):
        # 将字段转为可用于查询的语句
        parameter_values = value.split(',')
        parameter_values = [param_value for param_value in parameter_values if param_value and param_value != 'null']
        try:
            # 最小时间
            if 'min_' in field:
                field = field.replace('min_', '')
                search_type = 'gte'
            # 最大时间
            elif 'max_' in field:
                field = field.replace('max_', '')
                search_type = 'lte'
            # 布尔
            elif model._meta.get_field(field).get_internal_type() == 'BooleanField':
                field = field
                search_type = ''
                tmp_parameter_values = []
                for param_value in parameter_values:
                    if param_value.lower() == 'true':
                        tmp_parameter_values.append(True)
                    if param_value.lower() == 'false':
                        tmp_parameter_values.append(False)
                parameter_values = tmp_parameter_values
            # 布尔
            elif model._meta.get_field(field).get_internal_type() == 'IntegerField':
                field = int(field)
                search_type = 'in'
            # 外鍵
            elif check_model_field(model, field, ForeignKey):
                field = f'{field}__id'
                search_type = ''
            # 多对多
            elif check_model_field(model, field, ManyToManyField):
                field = f'{field}__id'
                search_type = ''
            else:
                field = field
                search_type = 'icontains'
            if search_type:
                return f'{field}__{search_type}', parameter_values
            else:
                return field, parameter_values
        except:
            return field, parameter_values
    #
    # def filter_queryset(self, request, queryset, view):
    #     query_parameters = self.get_valid_query_parameters(request, view)
    #     if not query_parameters:
    #         return queryset
    #     conditions = []
    #     for key, value in query_parameters.items():
    #         queries = []
    #         parameter_key, parameter_values = self.change_field_to_valid(Sample, key, value)
    #         for parameter_value in parameter_values:
    #             queries.append(models.Q(**{parameter_key: parameter_value}))
    #         if queries:
    #             conditions.append(reduce(operator.or_, queries))
    #     if conditions:
    #         queryset = queryset.filter(reduce(operator.and_, conditions))
    #     return queryset


