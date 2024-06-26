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

/**
 * 
 * @export
 * @enum {string}
 */
export enum BioApiStatus {
    init = 'init',
    completed = 'completed',
    error = 'error'
}

export function BioApiStatusFromJSON(json: any): BioApiStatus {
    return json as BioApiStatus;
}

export function BioApiStatusToJSON(value?: BioApiStatus): any {
    return value as any;
}

