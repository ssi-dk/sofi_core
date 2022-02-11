def removeNullProperty(expr):
    return {"$ifNull": [expr, "$$REMOVE"]}


"""
    From list, we are missing:

    PHASE 2:
    - Pathotype_final
    - Virulence_genes
    - Adheasion_final
    - Toxin_final
    - AMR_profile
    - ResFinder_version
    - QC_cgMLST%
    - cgMLST skema Salmonella
    - cgMLST skema E. coli
    - cgMLST skema Campylobacter
    - cgMLST skema Listeria
    - cgMLST skema Klebsiella
    - Sero_serotype_finder
"""


def agg_pipeline(changed_ids=None):
    pipeline = [
        {
            "$lookup": {
                "from": "sofi_species_to_mlstschema_mapping",
                "localField": "categories.species_detection.summary.species",
                "foreignField": "species",
                "as": "mlstlookup",
            }
        },
        # Find all the sequences for the same isolate, and sort them such that the
        # latest sequence is at the start of the 'siblings' array
        {
            "$lookup": {
                "from": "samples",
                "let": {"iso_id": "$display_name"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$display_name", "$$iso_id"]}}},
                    {"$sort": {"_id": -1}},
                    {"$project": {"sequence_id": "$name"}},
                ],
                "as": "siblings",
            }
        },
        {
            "$project": {
                "isolate_id": "$display_name",
                "sequence_id": "$categories.sample_info.summary.sofi_sequence_id",
                "run_id": "$categories.sample_info.summary.experiment_name",
                "run_date": "$categories.summary.sample_info.sequence_run_date",
                "institution": "$categories.sample_info.summary.institution",
                "project_number": "$categories.sample_info.summary.project_no",
                "project_title": "$categories.sample_info.summary.project_title",
                "date_sample": "$metadata.created_at",
                "date_sofi": "$$NOW",
                "qc_detected_species": "$categories.species_detection.summary.detected_species",
                "qc_provided_species": "$categories.sample_info.summary.provided_species",
                "subspecies": "$categories.serotype.summary.Subspecies",
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
                "resistance_genes": {
                    "$concat": [
                        "$categories.resistance.summary.genes"
                        + " "
                        + "$categories.resistance.summary.point_mutations"
                    ]
                },
                "sero_enterobase": "$categories.serotype.report.enterobase_serotype1",
                "sero_seqsero": "$categories.serotype.report.seqsero_serotype",
                "serotype_final": removeNullProperty(
                    {
                        "$cond": {
                            "if": {
                                "$eq": [
                                    "$categories.serotype.report.enterobase_serotype1",
                                    "$categories.serotype.report.seqsero_serotype",
                                ],
                            },
                            "then": "$categories.serotype.report.seqsero_serotype",
                            "else": None,
                        },
                    }
                ),
                "sero_antigen_seqsero": "$categories.serotype.summary.antigenic_profile",
                "sero_d_tartrate": "$categories.serotype.summary.D-tartrate_pos10",
                "mlst_schema": {"$arrayElemAt": ["$mlstlookup.schema", 0]},
                # "siblings": "$siblings",
                "latest_for_isolate": {"$arrayElemAt": ["$siblings.sequence_id", 0]},
                # grabbing whole object for ST, must pluck specific field later in the pipeline
                "st": "$categories.mlst.summary.sequence_type",
                "qc_action": "$categories.stamper.stamp.value",
                "qc_ambiguous_sites": "$categories.mapping_qc.summary.snps.x10_10%.snps",
                "qc_unclassified_reads": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "res": {
                                    "$arrayElemAt": [
                                        {
                                            "$filter": {
                                                "input": "$categories.stamper.summary.tests",
                                                "as": "elem",
                                                "cond": {
                                                    "$eq": [
                                                        "$$elem.name",
                                                        "unclassified_level_ok",
                                                    ]
                                                },
                                            }
                                        },
                                        0,
                                    ]
                                },
                            },
                            "in": "$$res.value",
                        }
                    }
                ),
                "qc_db_id": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "res": {
                                    "$arrayElemAt": [
                                        {
                                            "$filter": {
                                                "input": "$categories.stamper.summary.tests",
                                                "as": "elem",
                                                "cond": {
                                                    "$eq": [
                                                        "$$elem.name",
                                                        "species_in_db",
                                                    ]
                                                },
                                            }
                                        },
                                        0,
                                    ]
                                },
                            },
                            "in": "$$res.value",
                        }
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
        # pluck the specific schema from ST based on lookup, and replace it
        {
            "$addFields": {
                "st": {
                    "$let": {
                        "vars": {
                            "res": {
                                "$arrayElemAt": [
                                    {
                                        "$filter": {
                                            "input": {
                                                "$map": {
                                                    "input": {"$objectToArray": "$st"},
                                                    "in": {
                                                        "k": "$$this.k",
                                                        "v": "$$this.v",
                                                    },
                                                }
                                            },
                                            "as": "elem",
                                            "cond": {
                                                "$eq": ["$$elem.k", "$mlst_schema"]
                                            },
                                        }
                                    },
                                    0,
                                ]
                            }
                        },
                        "in": "$$res.v",
                    }
                }
            }
        },
        {
            "$set": {
                "st_final": {
                    "$cond": {
                        "if": {"$regexMatch": {"input": "$st", "regex": "\\*"}},
                        "then": None,
                        "else": "$st",
                    },
                }
            }
        },
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
