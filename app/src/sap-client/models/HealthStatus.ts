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
export enum HealthStatus {
    Unhealthy = 'Unhealthy',
    Degraded = 'Degraded',
    Healthy = 'Healthy'
}

export function HealthStatusFromJSON(json: any): HealthStatus {
    return json as HealthStatus;
}

export function HealthStatusToJSON(value?: HealthStatus): any {
    return value as any;
}

