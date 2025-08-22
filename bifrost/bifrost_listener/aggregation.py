def removeNullProperty(expr):
    return {"$ifNull": [expr, "$$REMOVE"]}


"""
    From list, we are missing:

    PHASE 2:
    - Pathotype_final
    - Toxin_final
    - QC_cgMLST%
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
        # Add lookup for existing data to check userchanged_ fields
        {
            "$lookup": {
                "from": "sap_analysis_results",
                "localField": "_id",
                "foreignField": "_id",
                "as": "existing_data"
            }
        },
        {
            "$addFields": {
                "existing": {"$arrayElemAt": ["$existing_data", 0]}
            }
        },
        {
            "$project": {
                "existingData": "$existing",
                "isolate_id": {
                    "$cond": {
                        "if": "$existing.userchanged_isolate_id",
                        "then": "$existing.isolate_id",
                        "else": "$categories.sample_info.summary.sample_name"
                    }
                },
                "sequence_id": {
                    "$cond": {
                        "if": "$existing.userchanged_sequence_id",
                        "then": "$existing.sequence_id",
                        "else": "$categories.sample_info.summary.sofi_sequence_id"
                    }
                },
                "run_id": {
                    "$cond": {
                        "if": "$existing.userchanged_run_id",
                        "then": "$existing.run_id",
                        "else": "$categories.sample_info.summary.experiment_name"
                    }
                },
                "date_run": {
                    "$cond": {
                        "if": "$existing.userchanged_date_run",
                        "then": "$existing.date_run",
                        "else": {"$toDate": "$categories.sample_info.summary.sequence_run_date"}
                    }
                },
                "institution": {
                    "$cond": {
                        "if": "$existing.userchanged_institution",
                        "then": "$existing.institution",
                        "else": "$categories.sample_info.summary.institution"
                    }
                },
                "project_number": {
                    "$cond": {
                        "if": "$existing.userchanged_project_number",
                        "then": "$existing.project_number",
                        "else": "$categories.sample_info.summary.project_no"
                    }
                },
                "project_title": {
                    "$cond": {
                        "if": "$existing.userchanged_project_title",
                        "then": "$existing.project_title",
                        "else": "$categories.sample_info.summary.project_title"
                    }
                },
                "date_sofi": {
                    "$cond": {
                        "if": "$existing.userchanged_date_sofi",
                        "then": "$existing.date_sofi",
                        "else": {"$toDate": "$metadata.created_at"}
                    }
                },
                "date_analysis_sofi": {
                    "$cond": {
                        "if": "$existing.userchanged_date_analysis_sofi",
                        "then": "$existing.date_analysis_sofi",
                        "else": {"$toDate": "$metadata.created_at"}
                    }
                },
                "qc_detected_species": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_detected_species",
                        "then": "$existing.qc_detected_species",
                        "else": "$categories.species_detection.summary.detected_species"
                    }
                },
                "qc_provided_species": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_provided_species",
                        "then": "$existing.qc_provided_species",
                        "else": {
                            "$cond": {
                                "if": "$categories.sample_info.summary.provided_species",
                                "then": {"$toString": "$categories.sample_info.summary.provided_species"},
                                "else": "$null"
                            }
                        }
                    }
                },
                "subspecies": {
                    "$cond": {
                        "if": "$existing.userchanged_subspecies",
                        "then": "$existing.subspecies",
                        "else": "$categories.serotype.summary.Subspecies"
                    }
                },
                "species_final": {
                    "$cond": {
                        "if": "$existing.userchanged_species_final",
                        "then": "$existing.species_final",
                        "else": removeNullProperty(
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
                        )
                    }
                },
                "sequence_filename": {
                    "$cond": {
                        "if": "$existing.userchanged_sequence_filename",
                        "then": "$existing.sequence_filename",
                        "else": {
                            "$reduce": {
                                "input": "$categories.paired_reads.summary.data",
                                "initialValue": "",
                                "in": {"$concat": ["$$value", "$$this", " "]},
                            }
                        }
                    }
                },
                "resistance_genes": {
                    "$cond": {
                        "if": "$existing.userchanged_resistance_genes",
                        "then": "$existing.resistance_genes",
                        "else": {
                            "$reduce": {
                                "input": {
                                    "$reduce": {
                                        "input": {
                                            "$map": {
                                                "input": {"$objectToArray": "$categories.resistance.report.phenotypes"},
                                                "as": "phenotype",
                                                "in": {
                                                    "$reduce": {
                                                        "input": {"$objectToArray": "$$phenotype.v.genes"},
                                                        "initialValue": [],
                                                        "in": {"$concatArrays": ["$$value", ["$$this.k"]]}
                                                    }
                                                }
                                            }
                                        },
                                        "initialValue": [],
                                        "in": {"$setUnion": ["$$value", "$$this"]}
                                    }
                                },
                                "initialValue": "",
                                "in": {
                                    "$cond": {
                                        "if": {"$eq": ["$$value",""]},
                                        "then": "$$this",
                                        "else": {"$concat":["$$value", ", ", "$$this"]}
                                    }
                                }
                            }
                        }
                    }
                },
                "amr_profile": {
                    "$cond": {
                        "if": "$existing.userchanged_amr_profile",
                        "then": "$existing.amr_profile",
                        "else": "$categories.resistance.summary"
                    }
                },
                "resistance": "$categories.resistance",
                "resfinder_version": {
                    "$cond": {
                        "if": "$existing.userchanged_resfinder_version",
                        "then": "$existing.resfinder_version",
                        "else": "$categories.resistance.resfinder_version"
                    }
                },
                "sero_enterobase": {
                    "$cond": {
                        "if": "$existing.userchanged_sero_enterobase",
                        "then": "$existing.sero_enterobase",
                        "else": "$categories.serotype.report.enterobase_serotype1"
                    }
                },
                "sero_seqsero": {
                    "$cond": {
                        "if": "$existing.userchanged_sero_seqsero",
                        "then": "$existing.sero_seqsero",
                        "else": "$categories.serotype.report.seqsero_serotype"
                    }
                },
                "sero_antigen_seqsero": {
                    "$cond": {
                        "if": "$existing.userchanged_sero_antigen_seqsero",
                        "then": "$existing.sero_antigen_seqsero",
                        "else": "$categories.serotype.summary.antigenic_profile"
                    }
                },
                "sero_serotype_finder": {
                    "$cond": {
                        "if": "$existing.userchanged_sero_serotype_finder",
                        "then": "$existing.sero_serotype_finder",
                        "else": "$categories.bifrost_sp_ecoli.summary.OH"
                    }
                },
                "sero_d_tartrate": {
                    "$cond": {
                        "if": "$existing.userchanged_sero_d_tartrate",
                        "then": "$existing.sero_d_tartrate",
                        "else": "$categories.serotype.summary.D-tartrate_pos10"
                    }
                },
                "mlst_schema": {"$arrayElemAt": ["$mlstlookup.schema", 0]},
                "latest_for_isolate": {"$arrayElemAt": ["$siblings.sequence_id", 0]},
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
                "qc_action": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_action",
                        "then": "$existing.qc_action",
                        "else": "$categories.stamper.stamp.value"
                    }
                },
                "qc_ambiguous_sites": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_ambiguous_sites",
                        "then": "$existing.qc_ambiguous_sites",
                        "else": "$categories.mapping_qc.summary.snps.x10_10%.snps"
                    }
                },
                "qc_unclassified_reads": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_unclassified_reads",
                        "then": "$existing.qc_unclassified_reads",
                        "else": removeNullProperty(
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
                        )
                    }
                },
                "qc_db_id": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_db_id",
                        "then": "$existing.qc_db_id",
                        "else": removeNullProperty(
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
                        )
                    }
                },
                "qc_db_id2": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_db_id2",
                        "then": "$existing.qc_db_id2",
                        "else": "$categories.species_detection.summary.name_classified_species_2"
                    }
                },
                "qc_failed_tests": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_failed_tests",
                        "then": "$existing.qc_failed_tests",
                        "else": removeNullProperty(
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
                        )
                    }
                },
                "qc_genome1x": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_genome1x",
                        "then": "$existing.qc_genome1x",
                        "else": "$categories.denovo_assembly.summary.length"
                    }
                },
                "qc_genome10x": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_genome10x",
                        "then": "$existing.qc_genome10x",
                        "else": "$categories.mapping_qc.summary.values_at_floor_of_depth.x10.length"
                    }
                },
                "qc_gsize_diff1x10": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_gsize_diff1x10",
                        "then": "$existing.qc_gsize_diff1x10",
                        "else": removeNullProperty(
                            {
                                "$let": {
                                    "vars": {
                                        "x1": "$categories.denovo_assembly.summary.length",
                                        "x10": "$categories.mapping_qc.summary.values_at_floor_of_depth.x10.length",
                                    },
                                    "in": {
                                        "$subtract": ["$$x1", "$$x10"],
                                    },
                                }
                            }
                        )
                    }
                },
                "qc_avg_coverage": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_avg_coverage",
                        "then": "$existing.qc_avg_coverage",
                        "else": "$categories.denovo_assembly.summary.depth"
                    }
                },
                "qc_num_contigs": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_num_contigs",
                        "then": "$existing.qc_num_contigs",
                        "else": "$categories.denovo_assembly.summary.contigs"
                    }
                },
                "qc_num_reads": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_num_reads",
                        "then": "$existing.qc_num_reads",
                        "else": "$categories.size_check.summary.num_of_reads"
                    }
                },
                "trst": {
                    "$cond": {
                        "if": "$existing.userchanged_trst",
                        "then": "$existing.trst",
                        "else": "$categories.bifrost_sp_cdiff.summary.TRST"
                    }
                },
                "tcda": {
                    "$cond": {
                        "if": "$existing.userchanged_tcda",
                        "then": "$existing.tcda",
                        "else": "$categories.bifrost_sp_cdiff.summary.tcdA"
                    }
                },
                "tcdb": {
                    "$cond": {
                        "if": "$existing.userchanged_tcdb",
                        "then": "$existing.tcdb",
                        "else": "$categories.bifrost_sp_cdiff.summary.tcdB"
                    }
                },
                "cdta_cdtb": {
                    "$cond": {
                        "if": "$existing.userchanged_cdta_cdtb",
                        "then": "$existing.cdta_cdtb",
                        "else": {
                            "$cond": {
                                "if": {
                                    "$or": [
                                        {"$eq": ["$categories.bifrost_sp_cdiff.summary.cdtA", None]},
                                        {"$eq": ["$categories.bifrost_sp_cdiff.summary.cdtB", None]}
                                    ]
                                },
                                "then": None,
                                "else": {
                                    "$cond": {
                                        "if": {"$eq": ["$categories.bifrost_sp_cdiff.summary.cdtA", "$categories.bifrost_sp_cdiff.summary.cdtB"]},
                                        "then": "$categories.bifrost_sp_cdiff.summary.cdtA",
                                        "else": {
                                            "$concat": [
                                                "$categories.bifrost_sp_cdiff.summary.cdtA",
                                                "/",
                                                "$categories.bifrost_sp_cdiff.summary.cdtB"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "del_117": {
                    "$cond": {
                        "if": "$existing.userchanged_del_117",
                        "then": "$existing.del_117",
                        "else": "$categories.bifrost_sp_cdiff.summary.117del"
                    }
                },
                "a117t": {
                    "$cond": {
                        "if": "$existing.userchanged_a117t",
                        "then": "$existing.a117t",
                        "else": "$categories.bifrost_sp_cdiff.summary.A117T"
                    }
                },
                "cdiff_details": {
                    "$cond": {
                        "if": "$existing.userchanged_cdiff_details",
                        "then": "$existing.cdiff_details",
                        "else": "$categories.bifrost_sp_cdiff.summary.cov_info"
                    }
                },
                "adhaesion": {
                    "$cond": {
                        "if": "$existing.userchanged_adhaesion",
                        "then": "$existing.adhaesion",
                        "else": "$categories.bifrost_sp_ecoli.summary.eae"
                    }
                },
                "toxin": {
                    "$cond": {
                        "if": "$existing.userchanged_toxin",
                        "then": "$existing.toxin",
                        "else": "$categories.bifrost_sp_ecoli.summary.stx"
                    }
                },
                "toxin_details": {
                    "$cond": {
                        "if": "$existing.userchanged_toxin_details",
                        "then": "$existing.toxin_details",
                        "else": "$categories.bifrost_sp_ecoli.summary.verbose"
                    }
                },
                "call_percent": {
                    "$cond": {
                        "if": "$existing.userchanged_call_percent",
                        "then": "$existing.call_percent",
                        "else": "$categories.cgmlst.summary.call_percent"
                    }
                },
                "multiple_alleles": {
                    "$cond": {
                        "if": "$existing.userchanged_multiple_alleles",
                        "then": "$existing.multiple_alleles",
                        "else": "$categories.cgmlst.summary.multiple_alleles"
                    }
                },
                "cgmlst_schema": {
                    "$cond": {
                        "if": "$existing.userchanged_cgmlst_schema",
                        "then": "$existing.cgmlst_schema",
                        "else": {
                            "$concat": [
                                "$categories.cgmlst.report.schema.name",
                                " (",
                                "$categories.cgmlst.report.schema.digest",
                                ")"
                            ]
                        }
                    }
                },
                "virulence_genes": {
                    "$cond": {
                        "if": "$existing.userchanged_virulence_genes",
                        "then": "$existing.virulence_genes",
                        "else": {
                            "$concat": [
                                "$categories.bifrost_sp_ecoli.summary.ehx",
                                ",",
                                "$categories.bifrost_sp_ecoli.summary.other",
                            ]
                        }
                    }
                },
                "bifrost_min_read_check": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_min_read_check",
                        "then": "$existing.bifrost_min_read_check",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^min_read_check"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_whats_my_species": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_whats_my_species",
                        "then": "$existing.bifrost_whats_my_species",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^whats_my_species"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_assemblatron": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_assemblatron",
                        "then": "$existing.bifrost_assemblatron",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^assemblatron"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_assembly_qc": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_assembly_qc",
                        "then": "$existing.bifrost_assembly_qc",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^assembly_qc"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_ssi_stamper": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_ssi_stamper",
                        "then": "$existing.bifrost_ssi_stamper",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^ssi_stamper"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_cge_mlst": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_cge_mlst",
                        "then": "$existing.bifrost_cge_mlst",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^cge_mlst"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_cge_resfinder": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_cge_resfinder",
                        "then": "$existing.bifrost_cge_resfinder",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^cge_resfinder"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_seqsero": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_seqsero",
                        "then": "$existing.bifrost_seqsero",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^seqsero"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_enterobase": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_enterobase",
                        "then": "$existing.bifrost_enterobase",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^enterobase"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_salmonella_subspecies_dtartrate": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_salmonella_subspecies_dtartrate",
                        "then": "$existing.bifrost_salmonella_subspecies_dtartrate",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^salmonella_subspecies_dtartrate"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_chewbbaca": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_chewbbaca",
                        "then": "$existing.bifrost_chewbbaca",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^chewbbaca"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_sp_ecoli": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_sp_ecoli",
                        "then": "$existing.bifrost_sp_ecoli",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^sp_ecoli"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_sp_cdiff": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_sp_cdiff",
                        "then": "$existing.bifrost_sp_cdiff",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^sp_cdiff"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "bifrost_amrfinderplus": {
                    "$cond": {
                        "if": "$existing.userchanged_bifrost_amrfinderplus",
                        "then": "$existing.bifrost_amrfinderplus",
                        "else": {
                            "$let": {
                                "vars": {
                                    "component": {
                                        "$arrayElemAt": [
                                            {
                                                "$sortArray":{
                                                    "input": {
                                                        "$filter": {
                                                            "input": "$components",
                                                            "as": "component",
                                                            "cond": {"$regexMatch": {"input": "$$component.name", "regex": "^amrfinderplus"}}
                                                        }
                                                    },
                                                    "sortBy":{"name":-1}
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                "in": "$$component.status"
                            }
                        }
                    }
                },
                "qc_main_sp_plus_uncl": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_main_sp_plus_uncl",
                        "then": "$existing.qc_main_sp_plus_uncl",
                        "else": removeNullProperty(
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
                                        ]
                                    },
                                    2,
                                ]
                            }
                        )
                    }
                },
                "qc_final": {
                    "$cond": {
                        "if": "$existing.userchanged_qc_final",
                        "then": "$existing.qc_final",
                        "else": removeNullProperty(
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
                        )
                    }
                },
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
                                                    "input": {
                                                        '$cond': {
                                                            'if': {
                                                                '$eq': [
                                                                    {
                                                                        '$type': '$st'
                                                                    }, 'object'
                                                                ]
                                                            }, 
                                                            'then': {
                                                                '$objectToArray': '$st'
                                                            }, 
                                                            'else': []
                                                        }
                                                    },
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
                    "$cond": {
                        "if": "$existing.userchanged_serotype_final",
                        "then": "$existing.serotype_final",
                        "else": {
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
                            }
                        }
                    }
                },
            },
        },
        {
            "$set": {
                "st_final": {
                    "$cond": {
                        "if": "$existingData.userchanged_st_final",
                        "then": "$existingData.st_final",
                        "else": {
                            "$cond": {
                                "if": {"$regexMatch": {"input": "$st", "regex": "^\d+$"}},
                                "then": "$st",
                                "else": None,
                            }
                        }
                    }
                }
            }
        },
        {
            '$replaceRoot': {
                'newRoot': {
                    '$mergeObjects': [
                        {
                            '$arrayToObject': {
                                '$map': {
                                    'input': [
                                        {
                                            'phenotype': 'amikacin', 
                                            'field': 'amr_ami'
                                        }, {
                                            'phenotype': 'ampicillin', 
                                            'field': 'amr_amp'
                                        }, {
                                            'phenotype': 'azithromycin', 
                                            'field': 'amr_azi'
                                        }, {
                                            'phenotype': 'cefepime', 
                                            'field': 'amr_fep'
                                        }, {
                                            'phenotype': 'cefotaxime', 
                                            'field': 'amr_fot'
                                        }, {
                                            'phenotype': 'cefotaxime/clavulanat', 
                                            'field': 'amr_f_c'
                                        }, {
                                            'phenotype': 'cefoxitin', 
                                            'field': 'amr_fox'
                                        }, {
                                            'phenotype': 'ceftazidime', 
                                            'field': 'amr_taz'
                                        }, {
                                            'phenotype': 'ceftazidime/clavulanat', 
                                            'field': 'amr_t_c'
                                        }, {
                                            'phenotype': 'chloramphenicol', 
                                            'field': 'amr_chl'
                                        }, {
                                            'phenotype': 'ciprofloxacin', 
                                            'field': 'amr_cip'
                                        }, {
                                            'phenotype': 'clindamycin', 
                                            'field': 'amr_cli'
                                        }, {
                                            'phenotype': 'colistin', 
                                            'field': 'amr_col'
                                        }, {
                                            'phenotype': 'daptomycin', 
                                            'field': 'amr_dap'
                                        }, {
                                            'phenotype': 'ertapenem', 
                                            'field': 'amr_etp'
                                        }, {
                                            'phenotype': 'erythromycin', 
                                            'field': 'amr_ery'
                                        }, {
                                            'phenotype': 'fusidinsyre', 
                                            'field': 'amr_fus'
                                        }, {
                                            'phenotype': 'gentamicin', 
                                            'field': 'amr_gen'
                                        }, {
                                            'phenotype': 'imipenem', 
                                            'field': 'amr_imi'
                                        }, {
                                            'phenotype': 'kanamycin', 
                                            'field': 'amr_kan'
                                        }, {
                                            'phenotype': 'linezolid', 
                                            'field': 'amr_lzd'
                                        }, {
                                            'phenotype': 'meropenem', 
                                            'field': 'amr_mero'
                                        }, {
                                            'phenotype': 'mupirocin', 
                                            'field': 'amr_mup'
                                        }, {
                                            'phenotype': 'nalidixan', 
                                            'field': 'amr_nal'
                                        }, {
                                            'phenotype': 'penicillin', 
                                            'field': 'amr_pen'
                                        }, {
                                            'phenotype': 'quinopristin/dalfopristin', 
                                            'field': 'amr_syn'
                                        }, {
                                            'phenotype': 'rifampin', 
                                            'field': 'amr_rif'
                                        }, {
                                            'phenotype': 'streptomycin', 
                                            'field': 'amr_str'
                                        }, {
                                            'phenotype': 'sulfamethoxazole', 
                                            'field': 'amr_sul'
                                        }, {
                                            'phenotype': 'teicoplanin', 
                                            'field': 'amr_tei'
                                        }, {
                                            'phenotype': 'temocillin', 
                                            'field': 'amr_trm'
                                        }, {
                                            'phenotype': 'tetracyklin', 
                                            'field': 'amr_tet'
                                        }, {
                                            'phenotype': 'tiamulin', 
                                            'field': 'amr_tia'
                                        }, {
                                            'phenotype': 'tigecycline', 
                                            'field': 'amr_tgc'
                                        }, {
                                            'phenotype': 'trimethoprim', 
                                            'field': 'amr_tmp'
                                        }, {
                                            'phenotype': 'vancomycin', 
                                            'field': 'amr_van'
                                        }
                                    ], 
                                    'in': [
                                        '$$this.field', {
                                            '$cond': {
                                                'if': {
                                                    '$switch': {
                                                        'branches': [
                                                            {'case': {'$eq': ['$$this.field', 'amr_ami']}, 'then': "$existingData.userchanged_amr_ami"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_amp']}, 'then': "$existingData.userchanged_amr_amp"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_azi']}, 'then': "$existingData.userchanged_amr_azi"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fep']}, 'then': "$existingData.userchanged_amr_fep"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fot']}, 'then': "$existingData.userchanged_amr_fot"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_f_c']}, 'then': "$existingData.userchanged_amr_f_c"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fox']}, 'then': "$existingData.userchanged_amr_fox"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_taz']}, 'then': "$existingData.userchanged_amr_taz"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_t_c']}, 'then': "$existingData.userchanged_amr_t_c"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_chl']}, 'then': "$existingData.userchanged_amr_chl"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_cip']}, 'then': "$existingData.userchanged_amr_cip"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_cli']}, 'then': "$existingData.userchanged_amr_cli"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_col']}, 'then': "$existingData.userchanged_amr_col"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_dap']}, 'then': "$existingData.userchanged_amr_dap"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_etp']}, 'then': "$existingData.userchanged_amr_etp"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_ery']}, 'then': "$existingData.userchanged_amr_ery"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fus']}, 'then': "$existingData.userchanged_amr_fus"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_gen']}, 'then': "$existingData.userchanged_amr_gen"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_imi']}, 'then': "$existingData.userchanged_amr_imi"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_kan']}, 'then': "$existingData.userchanged_amr_kan"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_lzd']}, 'then': "$existingData.userchanged_amr_lzd"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_mero']}, 'then': "$existingData.userchanged_amr_mero"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_mup']}, 'then': "$existingData.userchanged_amr_mup"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_nal']}, 'then': "$existingData.userchanged_amr_nal"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_pen']}, 'then': "$existingData.userchanged_amr_pen"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_syn']}, 'then': "$existingData.userchanged_amr_syn"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_rif']}, 'then': "$existingData.userchanged_amr_rif"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_str']}, 'then': "$existingData.userchanged_amr_str"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_sul']}, 'then': "$existingData.userchanged_amr_sul"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tei']}, 'then': "$existingData.userchanged_amr_tei"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_trm']}, 'then': "$existingData.userchanged_amr_trm"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tet']}, 'then': "$existingData.userchanged_amr_tet"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tia']}, 'then': "$existingData.userchanged_amr_tia"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tgc']}, 'then': "$existingData.userchanged_amr_tgc"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tmp']}, 'then': "$existingData.userchanged_amr_tmp"},
                                                            {'case': {'$eq': ['$$this.field', 'amr_van']}, 'then': "$existingData.userchanged_amr_van"}
                                                        ],
                                                        'default': False
                                                    }
                                                },
                                                'then': {
                                                    '$switch': {
                                                        'branches': [
                                                            {'case': {'$eq': ['$$this.field', 'amr_ami']}, 'then': '$existingData.amr_ami'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_amp']}, 'then': '$existingData.amr_amp'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_azi']}, 'then': '$existingData.amr_azi'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fep']}, 'then': '$existingData.amr_fep'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fot']}, 'then': '$existingData.amr_fot'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_f_c']}, 'then': '$existingData.amr_f_c'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fox']}, 'then': '$existingData.amr_fox'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_taz']}, 'then': '$existingData.amr_taz'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_t_c']}, 'then': '$existingData.amr_t_c'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_chl']}, 'then': '$existingData.amr_chl'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_cip']}, 'then': '$existingData.amr_cip'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_cli']}, 'then': '$existingData.amr_cli'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_col']}, 'then': '$existingData.amr_col'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_dap']}, 'then': '$existingData.amr_dap'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_etp']}, 'then': '$existingData.amr_etp'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_ery']}, 'then': '$existingData.amr_ery'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_fus']}, 'then': '$existingData.amr_fus'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_gen']}, 'then': '$existingData.amr_gen'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_imi']}, 'then': '$existingData.amr_imi'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_kan']}, 'then': '$existingData.amr_kan'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_lzd']}, 'then': '$existingData.amr_lzd'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_mero']}, 'then': '$existingData.amr_mero'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_mup']}, 'then': '$existingData.amr_mup'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_nal']}, 'then': '$existingData.amr_nal'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_pen']}, 'then': '$existingData.amr_pen'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_syn']}, 'then': '$existingData.amr_syn'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_rif']}, 'then': '$existingData.amr_rif'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_str']}, 'then': '$existingData.amr_str'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_sul']}, 'then': '$existingData.amr_sul'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tei']}, 'then': '$existingData.amr_tei'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_trm']}, 'then': '$existingData.amr_trm'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tet']}, 'then': '$existingData.amr_tet'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tia']}, 'then': '$existingData.amr_tia'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tgc']}, 'then': '$existingData.amr_tgc'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_tmp']}, 'then': '$existingData.amr_tmp'},
                                                            {'case': {'$eq': ['$$this.field', 'amr_van']}, 'then': '$existingData.amr_van'}
                                                        ],
                                                        'default': '$null'
                                                    }
                                                },
                                                'else': {
                                                    '$let': {
                                                        'vars': {
                                                            'amr': {
                                                                '$arrayElemAt': [{
                                                                '$map': {
                                                                    'input': {
                                                                        '$filter': {
                                                                            'input': {
                                                                                '$objectToArray': '$$CURRENT.resistance.report.phenotypes'
                                                                            }, 
                                                                            'as': 'phenotype', 
                                                                            'cond': {
                                                                                '$eq': [
                                                                                    '$$phenotype.k', '$$this.phenotype'
                                                                                ]
                                                                            }
                                                                        }
                                                                    }, 
                                                                    'in': '$$this.v'
                                                                }
                                                                }
                                                                , 0]
                                                            }
                                                        }, 
                                                        'in': {
                                                            '$switch': {
                                                                'branches': [
                                                                    {
                                                                        'case': {
                                                                            '$eq': [
                                                                                '$$amr', None
                                                                            ]
                                                                        }, 
                                                                        'then': 'Sensitiv'
                                                                    }, {
                                                                        'case': {
                                                                            '$eq': [
                                                                                '$$amr', '$null'
                                                                            ]
                                                                        }, 
                                                                        'then': 'Sensitiv'
                                                                    }, {
                                                                        'case': {
                                                                            '$eq': [
                                                                                '$$amr.genes', '$null'
                                                                            ]
                                                                        }, 
                                                                        'then': 'Sensitiv'
                                                                    }, {
                                                                        'case': {
                                                                            '$ne': [
                                                                                '$$amr.genes', '$null'
                                                                            ]
                                                                        }, 
                                                                        'then': 'Resistent'
                                                                    }
                                                                ], 
                                                                'default': 'Sensitiv'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }, '$$CURRENT'
                    ]
                }
            }
        },
        { "$unset": [ "resistance", "existingData"] },
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
