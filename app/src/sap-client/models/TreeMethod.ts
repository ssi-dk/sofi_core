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
export enum TreeMethod {
    single = 'single',
    complete = 'complete',
    average = 'average',
    weighted = 'weighted',
    centroid = 'centroid',
    median = 'median',
    ward = 'ward'
}

export function TreeMethodFromJSON(json: any): TreeMethod {
    return json as TreeMethod;
}

export function TreeMethodToJSON(value?: TreeMethod): any {
    return value as any;
}
