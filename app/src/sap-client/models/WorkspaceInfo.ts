// tslint:disable
/**
 * SOFI
 * SOFI Sekvensanalyseplatform
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    AnalysisResult,
    AnalysisResultFromJSON,
    AnalysisResultToJSON,
    MicroreactProject,
    MicroreactProjectFromJSON,
    MicroreactProjectToJSON,
} from './';

/**
 * 
 * @export
 * @interface WorkspaceInfo
 */
export interface WorkspaceInfo  {
    /**
     * 
     * @type {string}
     * @memberof WorkspaceInfo
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof WorkspaceInfo
     */
    name: string;
    /**
     * 
     * @type {Array<AnalysisResult>}
     * @memberof WorkspaceInfo
     */
    samples: Array<AnalysisResult>;
    /**
     * 
     * @type {MicroreactProject}
     * @memberof WorkspaceInfo
     */
    microreact?: MicroreactProject;
}

export function WorkspaceInfoFromJSON(json: any): WorkspaceInfo {
    return {
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': json['name'],
        'samples': (json['samples'] as Array<any>).map(AnalysisResultFromJSON),
        'microreact': !exists(json, 'microreact') ? undefined : MicroreactProjectFromJSON(json['microreact']),
    };
}

export function WorkspaceInfoToJSON(value?: WorkspaceInfo): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'id': value.id,
        'name': value.name,
        'samples': (value.samples as Array<any>).map(AnalysisResultToJSON),
        'microreact': MicroreactProjectToJSON(value.microreact),
    };
}


