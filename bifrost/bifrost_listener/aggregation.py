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
                    {
                        "$project": {
                            "sequence_id": "$categories.sample_info.summary.sofi_sequence_id"
                        }
                    },
                ],
                "as": "siblings",
            }
        },
        {
            "$project": {
                "isolate_id": "$display_name",
                "sequence_id": "$categories.sample_info.summary.sofi_sequence_id",
                "run_id": "$categories.sample_info.summary.experiment_name",
                "date_run": {
                    "$toDate": "$categories.sample_info.summary.sequence_run_date"
                },
                "institution": "$categories.sample_info.summary.institution",
                "project_number": "$categories.sample_info.summary.project_no",
                "project_title": "$categories.sample_info.summary.project_title",
                "date_sofi": {"$toDate": "$metadata.created_at"},
                "date_analysis_sofi": {"$toDate": "$metadata.created_at"},
                "qc_detected_species": "$categories.species_detection.summary.detected_species",
                "qc_provided_species": {
                        "$cond": {
                            "if": "$categories.sample_info.summary.provided_species",
                            "then": {"$toString": "$categories.sample_info.summary.provided_species"},
                            "else": "$null"
                        }
                    },
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
                "sero_antigen_seqsero": "$categories.serotype.summary.antigenic_profile",
                "sero_d_tartrate": "$categories.serotype.summary.D-tartrate_pos10",
                "mlst_schema": {"$arrayElemAt": ["$mlstlookup.schema", 0]},
                # "siblings": "$siblings",
                "latest_for_isolate": {"$arrayElemAt": ["$siblings.sequence_id", 0]},
                # grabbing whole object for ST, must pluck specific field later in the pipeline
                "st": "$categories.mlst.summary.sequence_type",
                "st_alleles": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "res": {
                                    "$arrayElemAt": [
                                        {
                                            "$filter": {
                                                "input": "$categories.mlst.report.data",
                                                "as": "elem",
                                                "cond": {
                                                    "$eq": [
                                                        "$$elem.db",
                                                        {
                                                            "$arrayElemAt": [
                                                                "$mlstlookup.schema",
                                                                0,
                                                            ]
                                                        },
                                                    ]
                                                },
                                            }
                                        },
                                        0,
                                    ]
                                },
                            },
                            "in": "$$res.alleles",
                        }
                    }
                ),
                "qc_action": "$categories.stamper.stamp.value",
                "qc_ambiguous_sites": "$categories.mapping_qc.summary.snps.x10_10%.snps",
                "qc_unclassified_reads": removeNullProperty(
                    {
                        "$round": [
                            {
                                "$multiply": [
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
                                    },
                                    100,
                                ]
                            },
                            2,
                        ]
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
                "qc_db_id2": "$categories.species_detection.summary.name_classified_species_2",
                "qc_failed_tests": removeNullProperty(
                    {
                        "$let": {
                            "vars": {
                                "res": {
                                    "$filter": {
                                        "input": "$categories.stamper.summary.tests",
                                        "as": "elem",
                                        "cond": {
                                            "$ne": [
                                                "$$elem.status",
                                                "pass",
                                            ]
                                        },
                                    }
                                },
                            },
                            "in": "$$res",
                        }
                    }
                ),
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
                "qc_num_reads": "$categories.size_check.summary.num_of_reads",
                "qc_main_sp_plus_uncl": removeNullProperty(
                    {
                        "$round": [
                            {
                                "$multiply": [
                                    100,
                                    {
                                        "$let": {
                                            "vars": {
                                                "main_sp": "$categories.species_detection.summary.percent_classified_species_1",
                                                "uncl": "$categories.species_detection.summary.percent_unclassified",
                                            },
                                            "in": {
                                                "$add": ["$$main_sp", "$$uncl"],
                                            },
                                        }
                                    },
                                ],
                            },
                            2,
                        ]
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
        # Calculate serotype_final
        {
            "$addFields": {
                "serotype_final": {
                    "$switch": {
                        "branches": [
                            # If identically
                            {
                                "case": {
                                    "$and": [
                                        "$sero_enterobase", {
                                            "$eq": [
                                                "$sero_enterobase", "$sero_seqsero"
                                            ]
                                        }
                                    ]
                                }, 
                                "then": "$sero_seqsero"
                            }, 
                            # If sero_enterobase suggesting is a part of the sero_seqsero suggestion
                            {
                                "case": {
                                    "$and": [
                                        "$sero_enterobase", {
                                            "$gte": [
                                                {
                                                    "$indexOfBytes": [
                                                        "$sero_seqsero", "$sero_enterobase"
                                                    ]
                                                }, 0
                                            ]
                                        }
                                    ]
                                }, 
                                "then": "$sero_enterobase"
                            }, 
                            # Specific for ST34 34 Typhimurium monophasic potential monophasic variant of Typhimurium 4,5,12:i:-
                            {
                                "case": {
                                    "$and": [
                                        {
                                            "$eq": [
                                                "$st", "34"
                                            ]
                                        },
                                        {
                                            "$eq": [
                                                "$sero_enterobase", "Typhimurium monophasic"
                                            ]
                                        },
                                        {
                                            "$eq": [
                                                "$sero_seqsero", "potential monophasic variant of Typhimurium"
                                            ]
                                        }
                                    ]
                                }, 
                                "then": "4,5,12:i:-"
                            }, 
                            # Specific for ST34 34 Typhimurium monophasic potential monophasic variant of Typhimurium(O5-)* 4,12:i:-
                            {
                                "case": {
                                    "$and": [
                                        {
                                            "$eq": [
                                                "$st", "34"
                                            ]
                                        },
                                        {
                                            "$eq": [
                                                "$sero_enterobase", "Typhimurium monophasic"
                                            ]
                                        },
                                        {
                                            "$eq": [
                                                "$sero_seqsero", "potential monophasic variant of Typhimurium(O5-)*"
                                            ]
                                        }
                                    ]
                                }, 
                                "then": "4,12:i:-"
                            }
                        ], 
                        "default": "$null"
                    },
                },
            },
        },
        # Create array of amr_classes with appropiate resistance level
        {
            "$addFields": {
                "categories.resistance.amr_resistances": {
                    "$arrayToObject": {
                        "$map": {
                            "input": {
                                "$reduce": {
                                    "input": {
                                        "$map": {
                                            "input": {
                                                "$objectToArray":
                                                "$categories.resistance.report.phenotypes",
                                            },
                                        "in": "$$this.v.amr_classes",
                                        },
                                    },
                                    "initialValue": [],
                                    "in": {
                                        "$setUnion": [
                                        "$$value",
                                        "$$this",
                                        ],
                                    },
                                },
                            },
                            "as": "amr_class",
                            "in": {
                                "k": "$$amr_class",
                                "v": "Resistent",
                            },
                        },
                    },
                },
            },
        },
        {
            "$set": {
                "st_final": {
                    "$cond": {
                        "if": {"$regexMatch": {"input": "$st", "regex": "^\d+$"}},
                        "then": "$st",
                        "else": None,
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
