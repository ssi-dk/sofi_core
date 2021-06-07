def removeNullProperty(expr):
    return {"$ifNull": [expr, "$$REMOVE"]}


"""
    From list, we are missing
    - Subspecies
    - Serotype*
    - ST
    - Pathotype
    - virulence_genes
    - All of AMR
    - resfinder
    - qc action & comment
    - qc ambiguous sites
    - unclassified reads: Is it mapping_qc.summary.mapped.reads_unmapped?
    - qc db id
    - qc failed tests
    - qc cgMLST%
"""


def agg_pipeline(changed_ids=None):
    pipeline = [
        {
            "$project": {
                "isolate_id": "$display_name",
                "sequence_id": "$name",
                "institution": "$categories.sample_info.summary.institution",
                "qc_detected_species": "$categories.species_detection.summary.detected_species",
                "qc_provided_species": "$categories.sample_info.summary.provided_species",
                "species_final": removeNullProperty(
                    {
                        "$cond": {
                            "if": {
                                "$eq": [
                                    "$categories.species_detection.summary.detected_species",
                                    "$categories.sample_info.summary.provided_species",
                                ],
                            },
                            "then": "$categories.species_detection.summary.detected_species",
                            "else": None,
                        },
                    }
                ),
                "sequence_filename": {
                    "$reduce": {
                        "input": "$categories.paired_reads.summary.data",
                        "initialValue": "",
                        "in": {"$concat": ["$$value", "$$this", ";"]},
                    }
                },
                "qc_genome1x": "$categories.denovo_assembly.summary.length",
                "qc_genome10x": "$categories.mapping_qc.summary.values_at_floor_of_depth.x10.length",
                "qc_gsize_diff1x10": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "x1": "$categories.denovo_assembly.summary.length",
                                "x10": "$categories.mapping_qc.summary.values_at_floor_of_depth.x10.length",
                            },
                            "in": {
                                "$subtract": ["$$x1", "$$x10"],
                            },
                        },
                    }
                ),
                "qc_avg_coverage": "$categories.denovo_assembly.summary.depth",
                "qc_num_contigs": "$categories.denovo_assembly.summary.contigs",
                "qc_num_reads": "$categories.denovo_assembly.summary.number_of_reads",
                "qc_main_sp_plus_uncl": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "main_sp": "$categories.species_detection.summary.percent_classified_species_1",
                                "uncl": "$categories.species_detection.summary.percent_unclassified",
                            },
                            "in": {
                                "$add": ["$$main_sp", "$$uncl"],
                            },
                        },
                    }
                ),
                "qc_score": {
                    "$filter": {
                        "input": "$categories.stamper.summary.tests",
                        "as": "elem",
                        "cond": {"$eq": ["$$elem.name", "qc_score"]},
                    }
                },
            },
        },
        # TODO: Perhaps we should merge on sequence id instead of mongo pseudokey.
        {
            "$merge": {
                "into": "sap_analysis_results",
                "on": "_id",
                "whenMatched": "merge",
            }
        },
    ]

    if changed_ids is not None:
        pipeline.insert(0, {"$match": {"_id": {"$in": changed_ids}}})

    return pipeline
