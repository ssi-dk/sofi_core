import { useToast } from "@chakra-ui/react";
import { RootState } from "app/root-reducer";
import { healthRequest, HealthSlice } from "../analysis-query-configs";
import { useDispatch, useSelector } from "react-redux";
import { requestAsync } from "redux-query";
import { HealthStatus } from "sap-client";
import React, { useEffect } from "react";

export const Health = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const health = useSelector<RootState>(
    (s) => s.entities.health
  ) as HealthSlice;

  useEffect(() => {
    dispatch(
      requestAsync({
        ...healthRequest("lims"),
      })
    );
    dispatch(
      requestAsync({
        ...healthRequest("tbr"),
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const messages = [];
    if (health) {
      if (health.hasOwnProperty("lims") && health.hasOwnProperty("tbr")) {
        if (health["tbr"] && health["tbr"].status == HealthStatus.Unhealthy) {
          messages.push("Could not connect to TBR.");
        }
        if (health["lims"] && health["lims"].status == HealthStatus.Unhealthy) {
          messages.push("Could not connect to LIMS.");
        }
      }

      if (messages.length > 0) {
        const description = (
          <>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </>
        );
        toast({
          title: "Error in service connection(s):",
          description,
          status: "warning",
          duration: null,
          isClosable: true,
        });
      }
    }
  }, [health, toast]);

  return null;
};
