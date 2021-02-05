import { RootState } from "app/root-reducer";
import React from "react";
import { useSelector } from "react-redux";
import { DataClearance, Organization, Permission, UserInfo } from "sap-client";

export const IfPermission = (props: {
  children: React.ReactNode;
  permission?: Permission;
  level?: DataClearance;
  institution?: Organization;
}) => {
  const { children, permission, level, institution } = props;

  const user = useSelector<RootState>((s) => s.entities.user ?? {}) as UserInfo;

  const hasPermission = (perm: Permission) => {
    return user?.permissions?.indexOf(perm) > -1;
  };

  const hasLevel = (l: DataClearance) => {
    return DataClearance[user?.data_clearance] >= DataClearance[l];
  };

  const hasInstitution = (inst: Organization) => {
    return user?.institution === inst;
  };

  if (
    hasPermission(permission) ||
    hasLevel(level) ||
    hasInstitution(institution)
  ) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <React.Fragment />;
};
