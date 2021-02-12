// tslint:disable
/**
 * SAP
 * Sekvensanalyseplatform
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
export enum ApprovalStatus {
    pending = 'pending',
    rejected = 'rejected',
    approved = 'approved'
}

export function ApprovalStatusFromJSON(json: any): ApprovalStatus {
    return json as ApprovalStatus;
}

export function ApprovalStatusToJSON(value?: ApprovalStatus): any {
    return value as any;
}
