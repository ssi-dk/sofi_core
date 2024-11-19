import HalfHolyGrailLayout from "layouts/half-holy-grail";
import React from "react";
import { Box, Heading, Button, Input } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useMutation } from "redux-query-react";
import { useLocation, Redirect } from "react-router-dom";
import { useMemo } from "react";
import { createWorkspaceFromSequenceIds } from "./workspaces-query-configs";

export function CreateWorkspaceFromMicroreact() {
  const [name, setName] = React.useState("");
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [isSending, setIsSending] = React.useState(false);
  const [isCreated, setIsCreated] = React.useState(false);
  const [isRequired, setIsRequired] = React.useState(false);

  const [
    createWorkspaceQueryState,
    createWorkspaceMutation,
  ] = useMutation((workspaceName: string, samples: string[]) =>
    createWorkspaceFromSequenceIds({ name: workspaceName, samples: samples })
  );

  const content = (
    <React.Fragment>
      <Box role="navigation" gridColumn="2 / 4" pb={5}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Heading>New workspace</Heading>
          <div style={{ width: "300px" }}></div>
        </div>
      </Box>
      <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
        <Input
          placeholder="Workspace name"
          value={name}
          required={isRequired}
          onChange={(x) => {
            setName(x.target.value);
          }}
        />

        <Button
          leftIcon={<AddIcon />}
          onClick={() => {
            if (!name) {
              setIsRequired(true);
              setTimeout(() => setIsRequired(false), 250);
              return;
            }
            setIsSending(true);
            const ids = searchParams.get("ids");
            if (ids) {
              const idArr = ids.split(",");
              createWorkspaceMutation(name, idArr);
              setIsCreated(true);
              setIsSending(false);
              alert("Workspace created.");
            }
          }}
          disabled={isSending && !isCreated}
        >
          {"Create workspace"}
        </Button>
      </Box>
      {isCreated ? <Redirect to="/workspaces" /> : null}
    </React.Fragment>
  );

  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
