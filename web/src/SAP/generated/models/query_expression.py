# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from web.src.SAP.generated.models.base_model_ import Model
from web.src.SAP.generated.models.query_operand import QueryOperand
from web.src.SAP.generated.models.query_operator import QueryOperator
from web.src.SAP.generated import util

from web.src.SAP.generated.models.query_operand import QueryOperand  # noqa: E501
from web.src.SAP.generated.models.query_operator import QueryOperator  # noqa: E501

class QueryExpression(Model):



    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
    Do not edit the class manually.
    """

    def __init__(self, left=None, operator=None, right=None):  # noqa: E501
        """QueryExpression - a model defined in OpenAPI

        :param left: The left of this QueryExpression.  # noqa: E501
        :type left: QueryOperand
        :param operator: The operator of this QueryExpression.  # noqa: E501
        :type operator: QueryOperator
        :param right: The right of this QueryExpression.  # noqa: E501
        :type right: QueryOperand
        """
        self.openapi_types = {
            'left': QueryOperand,
            'operator': QueryOperator,
            'right': QueryOperand,
        }

        self.attribute_map = {
            'left': 'left',
            'operator': 'operator',
            'right': 'right',
        }

        self._left = left
        self._operator = operator
        self._right = right

    @classmethod
    def from_dict(cls, dikt):
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The QueryExpression of this QueryExpression.  # noqa: E501
        :rtype: QueryExpression
        """
        return util.deserialize_model(dikt, cls)

    @property
    def left(self):
        """Gets the left of this QueryExpression.


        :return: The left of this QueryExpression.
        :rtype: QueryOperand
        """
        return self._left

    @left.setter
    def left(self, left):
        """Sets the left of this QueryExpression.


        :param left: The left of this QueryExpression.
        :type left: QueryOperand
        """

        self._left = left

    @property
    def operator(self):
        """Gets the operator of this QueryExpression.


        :return: The operator of this QueryExpression.
        :rtype: QueryOperator
        """
        return self._operator

    @operator.setter
    def operator(self, operator):
        """Sets the operator of this QueryExpression.


        :param operator: The operator of this QueryExpression.
        :type operator: QueryOperator
        """

        self._operator = operator

    @property
    def right(self):
        """Gets the right of this QueryExpression.


        :return: The right of this QueryExpression.
        :rtype: QueryOperand
        """
        return self._right

    @right.setter
    def right(self, right):
        """Sets the right of this QueryExpression.


        :param right: The right of this QueryExpression.
        :type right: QueryOperand
        """

        self._right = right