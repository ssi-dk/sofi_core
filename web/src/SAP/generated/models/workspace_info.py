# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from web.src.SAP.generated.models.base_model_ import Model
from web.src.SAP.generated.models.analysis_result import AnalysisResult
from web.src.SAP.generated.models.microreact_project import MicroreactProject
from web.src.SAP.generated import util

from web.src.SAP.generated.models.analysis_result import AnalysisResult  # noqa: E501
from web.src.SAP.generated.models.microreact_project import MicroreactProject  # noqa: E501

class WorkspaceInfo(Model):



    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
    Do not edit the class manually.
    """

    def __init__(self, id=None, name=None, samples=None, microreact=None):  # noqa: E501
        """WorkspaceInfo - a model defined in OpenAPI

        :param id: The id of this WorkspaceInfo.  # noqa: E501
        :type id: str
        :param name: The name of this WorkspaceInfo.  # noqa: E501
        :type name: str
        :param samples: The samples of this WorkspaceInfo.  # noqa: E501
        :type samples: List[AnalysisResult]
        :param microreact: The microreact of this WorkspaceInfo.  # noqa: E501
        :type microreact: MicroreactProject
        """
        self.openapi_types = {
            'id': str,
            'name': str,
            'samples': List[AnalysisResult],
            'microreact': MicroreactProject,
        }

        self.attribute_map = {
            'id': 'id',
            'name': 'name',
            'samples': 'samples',
            'microreact': 'microreact',
        }

        self._id = id
        self._name = name
        self._samples = samples
        self._microreact = microreact

    @classmethod
    def from_dict(cls, dikt):
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The WorkspaceInfo of this WorkspaceInfo.  # noqa: E501
        :rtype: WorkspaceInfo
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self):
        """Gets the id of this WorkspaceInfo.


        :return: The id of this WorkspaceInfo.
        :rtype: str
        """
        return self._id

    @id.setter
    def id(self, id):
        """Sets the id of this WorkspaceInfo.


        :param id: The id of this WorkspaceInfo.
        :type id: str
        """

        self._id = id

    @property
    def name(self):
        """Gets the name of this WorkspaceInfo.


        :return: The name of this WorkspaceInfo.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name):
        """Sets the name of this WorkspaceInfo.


        :param name: The name of this WorkspaceInfo.
        :type name: str
        """
        if name is None:
            raise ValueError("Invalid value for `name`, must not be `None`")  # noqa: E501

        self._name = name

    @property
    def samples(self):
        """Gets the samples of this WorkspaceInfo.


        :return: The samples of this WorkspaceInfo.
        :rtype: List[AnalysisResult]
        """
        return self._samples

    @samples.setter
    def samples(self, samples):
        """Sets the samples of this WorkspaceInfo.


        :param samples: The samples of this WorkspaceInfo.
        :type samples: List[AnalysisResult]
        """
        if samples is None:
            raise ValueError("Invalid value for `samples`, must not be `None`")  # noqa: E501

        self._samples = samples

    @property
    def microreact(self):
        """Gets the microreact of this WorkspaceInfo.


        :return: The microreact of this WorkspaceInfo.
        :rtype: MicroreactProject
        """
        return self._microreact

    @microreact.setter
    def microreact(self, microreact):
        """Sets the microreact of this WorkspaceInfo.


        :param microreact: The microreact of this WorkspaceInfo.
        :type microreact: MicroreactProject
        """

        self._microreact = microreact
