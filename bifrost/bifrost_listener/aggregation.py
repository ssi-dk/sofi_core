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
    - qc cgMLST%
"""


def agg_pipeline(changed_ids=None):
    pipeline = [
        {
            "$project": {
                "isolate_id": "$display_name",
                "sequence_id": "$name",
                "run_id": "$categories/sample_info/summary/experiment_name",
                "institution": "$categories.sample_info.summary.institution",
                "project_number": "$categories.sample_info.summary.project_no",
                "project_title": "$categories.sample_info.summary.project_title",
                "sampling_date": "$metadata.created_at",
                "sofi_date": "$$NOW",
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
                        "in": {"$concat": ["$$value", "$$this", " "]},
                    }
                },
                "sero_enterobase": "$categories.serotype.report.enterobase_serotype1",
                "sero_seqsero": "$categories.serotype.report.seqsero_serotype",
                "sero_antigen_seqsero": "$categories.serotype.summary.antigenic_profile",
                "qc_ambiguous_sites": "$categories.mapping_qc.summary.snps.x10_10%.snps",
                "qc_unclassified_reads": removeNullProperty(
                    {
                        "$arrayElemAt": [
                            {
                                "$filter": {
                                    "input": "$categories.stamper.summary.tests",
                                    "as": "elem",
                                    "cond": {
                                        "$eq": ["$$elem.name", "unclassified_level_ok"]
                                    },
                                }
                            },
                            0,
                        ]
                    }
                ),
                "qc_db_id": removeNullProperty(
                    {
                        "$arrayElemAt": [
                            {
                                "$filter": {
                                    "input": "$categories.stamper.summary.tests",
                                    "as": "elem",
                                    "cond": {"$eq": ["$$elem.name", "species_in_db"]},
                                }
                            },
                            0,
                        ]
                    }
                ),
                "qc_failed_tests": "$categories.stamper.stamp.reason",
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
                "qc_final": removeNullProperty(
                    {
                        "$arrayElemAt": [
                            {
                                "$filter": {
                                    "input": "$categories.stamper.summary.tests",
                                    "as": "elem",
                                    "cond": {"$eq": ["$$elem.name", "qc_score"]},
                                }
                            },
                            0,
                        ]
                    }
                ),
            },
        },
        {"$set": {"qc_final": "$qc_final.value"}},
        {
            "$merge": {
                "into": "sap_analysis_results",
                "on": "_id",
                "whenMatched": "replace",
            }
        },
    ]

    if changed_ids is not None:
        pipeline.insert(0, {"$match": {"_id": {"$in": changed_ids}}})

    return pipeline
