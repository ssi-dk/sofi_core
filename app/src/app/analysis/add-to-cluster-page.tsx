import HalfHolyGrailLayout from "layouts/half-holy-grail";
import React from "react";
import { Box, Heading, Button, Input } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useMutation } from "redux-query-react";
import { useLocation, Redirect } from "react-router-dom";
import { useMemo } from "react";
import { AddToClusterRequest } from "./analysis-query-configs";

export function AddToCluster() {
  const [clusterid, setClusterId] = React.useState("");
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [isSending, setIsSending] = React.useState(false);
  const [isCreated, setIsCreated] = React.useState(false);
  const [isRequired, setIsRequired] = React.useState(false);

  const [
    addToClusterQueryState,
    addToClusterMutation,
  ] = useMutation((cluster: string, samples: string[]) =>
    AddToClusterRequest({ clusterid: cluster, samples: samples })
  );

  const content = (
    <React.Fragment>
      <Box role="navigation" gridColumn="2 / 4" pb={5}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Heading>Add Samples To Cluster</Heading>
          <div style={{ width: "300px" }}></div>
        </div>
      </Box>
      <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
        <Input
          placeholder="Cluster ID"
          value={clusterid}
          required={isRequired}
          onChange={(x) => {
            setClusterId(x.target.value);
          }}
        />

        <Button
          leftIcon={<AddIcon />}
          onClick={() => {
            if (!clusterid) {
              setIsRequired(true);
              setTimeout(() => setIsRequired(false), 250);
              return;
            }
            setIsSending(true);
            const ids = searchParams.get("ids");
            if (ids) {
              const idArr = ids.split(",");
              addToClusterMutation(clusterid, idArr);
              setIsCreated(true);
              setIsSending(false);
              alert("Samples added to cluster.");
            }
          }}
          disabled={isSending && !isCreated}
        >
          {"Add to cluster"}
        </Button>
      </Box>
      {isCreated ? <Redirect to="/" /> : null}
    </React.Fragment>
  );

  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
