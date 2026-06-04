import React, { useMemo, useState } from "react";
import { Box, Flex, Heading, IconButton, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import Header from "app/header/header";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { Permission, Project, UserInfo } from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { getProjects, setIsPrivate } from "./projects-query-configs";
import { RepeatClockIcon } from "@chakra-ui/icons";
import { IfPermission } from "auth/if-permission";

export const ProjectsPage = () => {

    const { t } = useTranslation();

    const user = useSelector<RootState>(r => r.entities.user) as UserInfo;
    const { institution } = user;

    useRequest(getProjects())

    const projects = useSelector<RootState>(r => r.entities.projects) as Project[];

    const [,setIsPrivateMut] = useMutation(setIsPrivate)


    return (<>
        <IfPermission permission={Permission.projects_manage}>

        
        <Box
            display="flex"
            padding="8"
            height="100vh"
            width="100vw"
            flexDirection="column"
        >
            <Box role="heading" gridColumn="1 / 4">
                <Header sidebarWidth="300px" />
            </Box>
            <Box
                minH="100vh"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                margin="8"
            >
                <Heading>{institution} {t("Projects")}</Heading>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Identifier</Th>
                            <Th>Institution</Th>
                            <Th>Title</Th>
                            <Th>Project number</Th>
                            <Th>Sequence count</Th>
                            <Th>Private</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {projects && projects.map(p => <Tr key={p.project_key}>
                            <Td>
                                {p.project_key}
                            </Td>
                            <Td>
                                {institution}
                            </Td>
                            <Td>
                                {p.project_title}
                            </Td>
                            <Td>{p.project_number}</Td>
                            <Td>{p.count}</Td>
                            <Td>{p.is_private ? t("yes") : t("no")}<IconButton icon={<RepeatClockIcon />} onClick={() => setIsPrivateMut(p.project_key, !p.is_private)} /></Td>
                        </Tr>)}
                    </Tbody>
                </Table>
            </Box>
        </Box>
        </IfPermission>
    </>)
}