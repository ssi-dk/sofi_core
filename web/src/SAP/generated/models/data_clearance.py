# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from .base_model_ import Model
from .. import util


class DataClearance(Model):
    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).

    Do not edit the class manually.
    """

    """
    allowed enum values
    """
    OWN_INSTITUTION = "own-institution"
    CROSS_INSTITUTION = "cross-institution"
    ALL = "all"
    def __init__(self):  # noqa: E501
        """DataClearance - a model defined in OpenAPI

        """
        self.openapi_types = {
        }

        self.attribute_map = {
        }

    @classmethod
    def from_dict(cls, dikt) -> 'DataClearance':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The DataClearance of this DataClearance.  # noqa: E501
        :rtype: DataClearance
        """
        return util.deserialize_model(dikt, cls)