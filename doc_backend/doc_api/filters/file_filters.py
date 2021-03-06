from doc_api.filters.base_filters import BaseParameterFilter
from django.db import models
from functools import reduce
import operator
from rest_framework.filters import OrderingFilter
from doc_api.models import FileGroup, FileAttachment
from django.db.models import Count


class FileGroupParameterFilter(BaseParameterFilter):

    def get_filterset_class(self, view, queryset=None):
        try:
            return super().__init__(view=view, queryset=queryset)
        except:
            return None

    def filter_queryset(self, request, queryset, view):
        query_parameters = self.get_valid_query_parameters(request, view)
        conditions = []
        for key, value in query_parameters.items():
            queries = []
            parameter_key, parameter_values = self.change_field_to_valid(FileGroup, key, value)
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset


class FileAttachmentParameterFilter(BaseParameterFilter):

    def get_filterset_class(self, view, queryset=None):
        try:
            return super().__init__(view=view, queryset=queryset)
        except:
            return None

    def filter_queryset(self, request, queryset, view):
        query_parameters = self.get_valid_query_parameters(request, view)
        conditions = []
        for key, value in query_parameters.items():
            queries = []
            parameter_key, parameter_values = self.change_field_to_valid(FileAttachment, key, value)
            if key == 'group' and value == 'None':
                parameter_key = 'group'
                parameter_values = [None]
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset



