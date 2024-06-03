import React, { useCallback } from "react";
import { IconButton } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ViewIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";

type Props = {
  id: string;
};

export function ViewWorkspace(props: Props) {
  const { t } = useTranslation();
  const { id } = props;
  const history = useHistory();

  const onViewCallback = useCallback(() => {
    history.push(`/workspaces/${id}`);
  }, [history, id]);

  return (
    <IconButton
      icon={<ViewIcon />}
      aria-label={`${t("View workspace")}`}
      onClick={onViewCallback}
    />
  );
}
