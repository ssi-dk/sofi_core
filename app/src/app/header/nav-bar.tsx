import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Flex } from "@chakra-ui/react";
import { AttachmentIcon, CalendarIcon, EditIcon, LockIcon } from "@chakra-ui/icons";
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
      <IfPermission permission={Permission.approve}>
        <NavLink to="/approval-history">
          <Button leftIcon={<CalendarIcon />}>
            {t("My approval history")}
          </Button>
        </NavLink>
      </IfPermission>
      <IfPermission permission={Permission.approve}>
        <NavLink to="/manual-upload">
          <Button leftIcon={<AttachmentIcon />}>{t("Manual upload")}</Button>
        </NavLink>
      </IfPermission>
      <IfPermission permission={Permission.gdpr_manage}>
        <NavLink to="/gdpr/extract">
          <Button leftIcon={<LockIcon />}>{t("GDPR extract")}</Button>
        </NavLink>
      </IfPermission>
    </Flex>
  );
}

export default NavBar;
