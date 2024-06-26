# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from web.src.SAP.generated.models.base_model_ import Model
from web.src.SAP.generated.models.data_clearance import DataClearance
from web.src.SAP.generated.models.organization import Organization
from web.src.SAP.generated.models.permission import Permission
from web.src.SAP.generated import util

from web.src.SAP.generated.models.data_clearance import DataClearance  # noqa: E501
from web.src.SAP.generated.models.organization import Organization  # noqa: E501
from web.src.SAP.generated.models.permission import Permission  # noqa: E501

class UserInfo(Model):



    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
    Do not edit the class manually.
    """

    def __init__(self, user_id=None, data_clearance=None, institution=None, groups=None, permissions=None):  # noqa: E501
        """UserInfo - a model defined in OpenAPI

        :param user_id: The user_id of this UserInfo.  # noqa: E501
        :type user_id: str
        :param data_clearance: The data_clearance of this UserInfo.  # noqa: E501
        :type data_clearance: DataClearance
        :param institution: The institution of this UserInfo.  # noqa: E501
        :type institution: Organization
        :param groups: The groups of this UserInfo.  # noqa: E501
        :type groups: List[str]
        :param permissions: The permissions of this UserInfo.  # noqa: E501
        :type permissions: List[Permission]
        """
        self.openapi_types = {
            'user_id': str,
            'data_clearance': DataClearance,
            'institution': Organization,
            'groups': List[str],
            'permissions': List[Permission],
        }

        self.attribute_map = {
            'user_id': 'userId',
            'data_clearance': 'data_clearance',
            'institution': 'institution',
            'groups': 'groups',
            'permissions': 'permissions',
        }

        self._user_id = user_id
        self._data_clearance = data_clearance
        self._institution = institution
        self._groups = groups
        self._permissions = permissions

    @classmethod
    def from_dict(cls, dikt):
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The UserInfo of this UserInfo.  # noqa: E501
        :rtype: UserInfo
        """
        return util.deserialize_model(dikt, cls)

    @property
    def user_id(self):
        """Gets the user_id of this UserInfo.


        :return: The user_id of this UserInfo.
        :rtype: str
        """
        return self._user_id

    @user_id.setter
    def user_id(self, user_id):
        """Sets the user_id of this UserInfo.


        :param user_id: The user_id of this UserInfo.
        :type user_id: str
        """

        self._user_id = user_id

    @property
    def data_clearance(self):
        """Gets the data_clearance of this UserInfo.


        :return: The data_clearance of this UserInfo.
        :rtype: DataClearance
        """
        return self._data_clearance

    @data_clearance.setter
    def data_clearance(self, data_clearance):
        """Sets the data_clearance of this UserInfo.


        :param data_clearance: The data_clearance of this UserInfo.
        :type data_clearance: DataClearance
        """

        self._data_clearance = data_clearance

    @property
    def institution(self):
        """Gets the institution of this UserInfo.


        :return: The institution of this UserInfo.
        :rtype: Organization
        """
        return self._institution

    @institution.setter
    def institution(self, institution):
        """Sets the institution of this UserInfo.


        :param institution: The institution of this UserInfo.
        :type institution: Organization
        """

        self._institution = institution

    @property
    def groups(self):
        """Gets the groups of this UserInfo.


        :return: The groups of this UserInfo.
        :rtype: List[str]
        """
        return self._groups

    @groups.setter
    def groups(self, groups):
        """Sets the groups of this UserInfo.


        :param groups: The groups of this UserInfo.
        :type groups: List[str]
        """

        self._groups = groups

    @property
    def permissions(self):
        """Gets the permissions of this UserInfo.


        :return: The permissions of this UserInfo.
        :rtype: List[Permission]
        """
        return self._permissions

    @permissions.setter
    def permissions(self, permissions):
        """Sets the permissions of this UserInfo.


        :param permissions: The permissions of this UserInfo.
        :type permissions: List[Permission]
        """

        self._permissions = permissions
