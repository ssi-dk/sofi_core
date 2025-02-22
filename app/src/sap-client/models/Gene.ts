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
/**
 * 
 * @export
 * @interface Gene
 */
export interface Gene  {
    /**
     * 
     * @type {string}
     * @memberof Gene
     */
    gene_id?: string;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    identity?: number;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    ref_seq_length?: number;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    alignment_length?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof Gene
     */
    phenotypes?: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    depth?: number;
    /**
     * 
     * @type {string}
     * @memberof Gene
     */
    contig?: string;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    contig_start_pos?: number;
    /**
     * 
     * @type {number}
     * @memberof Gene
     */
    contig_end_pos?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof Gene
     */
    notes?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof Gene
     */
    pmids?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof Gene
     */
    ref_acc?: string;
}

export function GeneFromJSON(json: any): Gene {
    return {
        'gene_id': !exists(json, 'gene_id') ? undefined : json['gene_id'],
        'identity': !exists(json, 'identity') ? undefined : json['identity'],
        'ref_seq_length': !exists(json, 'ref_seq_length') ? undefined : json['ref_seq_length'],
        'alignment_length': !exists(json, 'alignment_length') ? undefined : json['alignment_length'],
        'phenotypes': !exists(json, 'phenotypes') ? undefined : json['phenotypes'],
        'depth': !exists(json, 'depth') ? undefined : json['depth'],
        'contig': !exists(json, 'contig') ? undefined : json['contig'],
        'contig_start_pos': !exists(json, 'contig_start_pos') ? undefined : json['contig_start_pos'],
        'contig_end_pos': !exists(json, 'contig_end_pos') ? undefined : json['contig_end_pos'],
        'notes': !exists(json, 'notes') ? undefined : json['notes'],
        'pmids': !exists(json, 'pmids') ? undefined : json['pmids'],
        'ref_acc': !exists(json, 'ref_acc') ? undefined : json['ref_acc'],
    };
}

export function GeneToJSON(value?: Gene): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'gene_id': value.gene_id,
        'identity': value.identity,
        'ref_seq_length': value.ref_seq_length,
        'alignment_length': value.alignment_length,
        'phenotypes': value.phenotypes,
        'depth': value.depth,
        'contig': value.contig,
        'contig_start_pos': value.contig_start_pos,
        'contig_end_pos': value.contig_end_pos,
        'notes': value.notes,
        'pmids': value.pmids,
        'ref_acc': value.ref_acc,
    };
}


