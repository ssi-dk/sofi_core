import React from "react";
import {
  Avatar,
  Popover,
  PopoverHeader,
  PopoverBody,
  PopoverContent,
  PopoverArrow,
  PopoverTrigger,
  Button,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { DataClearance, UserInfo } from "sap-client";
import { logout } from "auth/environment";
import { useRequest } from "redux-query-react";
import { requestUserInfo } from "app/user/user-query-configs";
import { useTranslation } from "react-i18next";

function AccountManager() {
  const { t } = useTranslation();

  const user = useSelector<RootState>((s) => s.entities.user ?? {}) as UserInfo;
  useRequest(requestUserInfo());

  const signout = React.useCallback(() => logout(), []);

  const groupLabel = React.useCallback(
    (s: string) => {
      switch (s) {
        case "sofi.passive":
          return `${t("User")}`;
        case "sofi.lab":
          return `${t("Lab tech")}`;
        case "sofi.lab-ac":
          return `${t("Lab AC")}`;
        case "sofi.microbiologists":
          return `${t("Microbiologist")}`;
        case "sofi.administrators":
          return `${t("Administrator")}`;
        default:
          return `${t("User")}`;
      }
    },
    [t]
  );

  const accessLevel = React.useCallback(
    (s: DataClearance) => {
      switch (s) {
        case DataClearance.own_institution:
          return `${t("Level")} 1`;
        case DataClearance.cross_institution:
          return `${t("Level")} 2`;
        case DataClearance.all:
          return `${t("Level")} 3`;
        default:
          return "";
      }
    },
    [t]
  );

  return (
    <Popover placement="top-start" arrowSize={18}>
      <PopoverTrigger>
        <Avatar size="sm" />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <Stat>
            <StatNumber fontSize="md">{user?.userId}</StatNumber>
          </Stat>
        </PopoverHeader>
        <PopoverBody>
          <Stat>
            <StatLabel>{user?.institution}</StatLabel>
            {user?.groups?.map((g) => (
              <StatNumber fontSize="sm">{groupLabel(g)}</StatNumber>
            ))}
            <StatLabel>{accessLevel(user?.data_clearance)}</StatLabel>
          </Stat>
        </PopoverBody>
        <Button onClick={signout}>{t("Logout")}</Button>
      </PopoverContent>
    </Popover>
  );
}

export default AccountManager;
