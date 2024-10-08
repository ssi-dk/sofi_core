# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from web.src.SAP.generated.models.base_model_ import Model
from web.src.SAP.generated import util


class Permission(Model):



    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
    Do not edit the class manually.
    """

    """
    allowed enum values
    """
    SEARCH = "search"
    EXPORT = "export"
    APPROVE = "approve"
    PHYLOGENY_READ = "phylogeny.read"
    PHYLOGENY_WRITE = "phylogeny.write"
    GDPR_MANAGE = "gdpr.manage"
    PERMISSIONS_WRITE = "permissions.write"
    def __init__(self):  # noqa: E501
        """Permission - a model defined in OpenAPI

        """
        self.openapi_types = {
        }

        self.attribute_map = {
        }

    @classmethod
    def from_dict(cls, dikt):
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The Permission of this Permission.  # noqa: E501
        :rtype: Permission
        """
        return util.deserialize_model(dikt, cls)
