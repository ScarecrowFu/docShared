from doc_api.filters.base_filters import BaseParameterFilter
from django.db import models
from functools import reduce
import operator
from rest_framework.filters import OrderingFilter
from doc_api.models import Announcement, RegisterCode, EmailVerificationCode
from django.db.models import Count


class AnnouncementParameterFilter(BaseParameterFilter):

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
            parameter_key, parameter_values = self.change_field_to_valid(Announcement, key, value)
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset


class RegisterCodeParameterFilter(BaseParameterFilter):

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
            parameter_key, parameter_values = self.change_field_to_valid(RegisterCode, key, value)
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset


class EmailVerificationCodeParameterFilter(BaseParameterFilter):

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
            parameter_key, parameter_values = self.change_field_to_valid(EmailVerificationCode, key, value)
            for parameter_value in parameter_values:
                queries.append(models.Q(**{parameter_key: parameter_value}))
            if queries:
                conditions.append(reduce(operator.or_, queries))
        if conditions:
            queryset = queryset.filter(reduce(operator.and_, conditions))
        return queryset

