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
    TreeMethod,
    TreeMethodFromJSON,
    TreeMethodToJSON,
} from './';

/**
 * 
 * @export
 * @interface BuildWorkspaceTreeRequestBody
 */
export interface BuildWorkspaceTreeRequestBody  {
    /**
     * 
     * @type {TreeMethod}
     * @memberof BuildWorkspaceTreeRequestBody
     */
    tree_method: TreeMethod;
}

export function BuildWorkspaceTreeRequestBodyFromJSON(json: any): BuildWorkspaceTreeRequestBody {
    return {
        'tree_method': TreeMethodFromJSON(json['tree_method']),
    };
}

export function BuildWorkspaceTreeRequestBodyToJSON(value?: BuildWorkspaceTreeRequestBody): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'tree_method': TreeMethodToJSON(value.tree_method),
    };
}

