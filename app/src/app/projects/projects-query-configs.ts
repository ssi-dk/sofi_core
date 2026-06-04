import {
    getProjects as getProjectsApi,
    setIsPrivate as setIsPrivateApi,
    Project
} from "sap-client";
import { getUrl } from "service";

export const getProjects = () => {

    const base = getProjectsApi()
    base.url = getUrl(base.url);
    base.transform = (response: Project[]) => ({
        projects: response,
    });
    base.update = {
        projects: (oldValue, newValue) => {
            return newValue;
        },
    };
    base.force = true;
    return base;
};

export const setIsPrivate = (projectKey: string, isPrivate: boolean) => {
    const base = setIsPrivateApi({ projectKey, isPrivate });
    base.url = getUrl(base.url);
    base.update = {
        projects: (oldvalue) => {
            const newValue: Project[] = structuredClone(oldvalue);
            newValue.find(p => p.project_key === projectKey)!.is_private = isPrivate;
            return newValue;
        }
    }
    base.force = true;
    return base;
}