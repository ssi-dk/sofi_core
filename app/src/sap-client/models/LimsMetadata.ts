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

import {
    BaseMetadata,
    BaseMetadataFromJSON,
    BaseMetadataToJSON,
    LimsSpecificMetadata,
    LimsSpecificMetadataFromJSON,
    LimsSpecificMetadataToJSON,
    Organization,
    OrganizationFromJSON,
    OrganizationToJSON,
} from './';

/**
 * @type LimsMetadata
 * @export
 */
export interface LimsMetadata extends BaseMetadata, LimsSpecificMetadata {
}

export function LimsMetadataFromJSON(json: any): LimsMetadata {
    return {
        ...BaseMetadataFromJSON(json),
        ...LimsSpecificMetadataFromJSON(json),
    };
}

export function LimsMetadataToJSON(value?: LimsMetadata): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        ...BaseMetadataToJSON(value),
        ...LimsSpecificMetadataToJSON(value),
    };
}
