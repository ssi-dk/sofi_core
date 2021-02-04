import { RootState } from "app/root-reducer";
import React from "react";
import { useSelector } from "react-redux";
import { Permission, UserInfo } from "sap-client";

export const IfPermission = (props: {
  children: React.ReactNode;
  permission: Permission;
}) => {
  const { children, permission } = props;

  const user = useSelector<RootState>((s) =>
    Object.values(s.entities.user ?? {})
  ) as UserInfo;

  const hasPermission = (perm: Permission) => {
    return user?.permissions?.indexOf(perm) > -1;
  };

  if (hasPermission(permission)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <React.Fragment />;
};
