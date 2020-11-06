from doc_api.filters.base_filters import BaseParameterFilter
from django.db import models
from functools import reduce
import operator
from doc_api.models.user_models import User


class UserParameterFilter(BaseParameterFilter):

    def get_filterset_class(self, view, queryset=None):
        try:
            return super().__init__(view=view, queryset=queryset)
        except:
            return None

    def filter_queryset(self, request, queryset, view):
        query_parameters = self.get_valid_query_parameters(request, view)
        if 'is_deleted' not in query_parameters:
            # 默认返出未删除数据
            conditions = [reduce(operator.or_, [models.Q(**{'is_deleted': False})])]
        else:
            conditions = []
        for key, value in query_parameters.items():
            queries = []
            parameter_key, parameter_values = self.change_field_to_valid(User, key, value)
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset


