import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Flex,  } from "@chakra-ui/react";
import {
  AttachmentIcon,
  CalendarIcon,
  EditIcon,
  LockIcon,
  SunIcon,
  ViewIcon,
  HamburgerIcon
} from "@chakra-ui/icons";
import { Permission } from "sap-client";
import { IfPermission } from "auth/if-permission";
import { useTranslation } from "react-i18next";

function NavBar() {
  const { t } = useTranslation();
  return (
    <Flex align="center" justify="space-around" gridGap={5}>
      <NavLink to="/">
        <Button leftIcon={<EditIcon />}>{t("Analysis results")}</Button>
      </NavLink>
      <NavLink to="/workspaces">
        <Button leftIcon={<ViewIcon />}>{t("Workspaces")}</Button>
      </NavLink>
      <NavLink to="/clusters">
        <Button leftIcon={<HamburgerIcon />}>{t("Clusters")}</Button>
      </NavLink>
      <IfPermission permission={Permission.approve}>
        <NavLink to="/approval-history">
          <Button leftIcon={<CalendarIcon />}>{t("Approval history")}</Button>
        </NavLink>
      </IfPermission>
      <IfPermission permission={Permission.approve}>
        <NavLink to="/manual-upload">
          <Button leftIcon={<AttachmentIcon />}>{t("Manual upload")}</Button>
        </NavLink>
      </IfPermission>
      <IfPermission permission={Permission.gdpr_manage}>
        <NavLink to="/gdpr">
          <Button leftIcon={<LockIcon />}>{t("GDPR")}</Button>
        </NavLink>
      </IfPermission>
    </Flex>
  );
}

export default NavBar;
