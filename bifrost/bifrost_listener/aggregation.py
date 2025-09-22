preserveValues = True

def removeNullProperty(expr):
    return {"$ifNull": [expr, "$$REMOVE"]}

def userChangedConditionDynamic(field_name, new_value_expr):
    if(not preserveValues):
        return new_value_expr
    return {
        "$cond": {
            "if": f"$existing.userchanged_{{field_name}}",
            "then": f"$existing.{{field_name}}",
            "else": new_value_expr
        }
    }
def userChangedCondition(field_name, new_value_expr):
    if(not preserveValues):
        return {
            field_name: userChangedConditionDynamic(field_name, new_value_expr)
        }
    return {
        field_name: {
            "$cond": {
                "if": f"$existing.userchanged_{field_name}",
                "then": f"$existing.{field_name}",
                "else": new_value_expr
            }
        }
    }

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
        {
            "$addFields": {
                "lookupIsolate": "$categories.sample_info.summary.sample_name"
            }
        },
        {
            "$addFields": {
                "lookupSofi": "$categories.sample_info.summary.sofi_sequence_id"
            }
        },
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
            "$lookup": {
                "from": "sap_analysis_results",
                "localField": "lookupSofi",
                "foreignField": "sequence_id",
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
                **userChangedCondition("isolate_id", "$categories.sample_info.summary.sample_name"),
                **userChangedCondition("sequence_id", "$categories.sample_info.summary.sofi_sequence_id"),
                **userChangedCondition("run_id", "$categories.sample_info.summary.experiment_name"), 
                **userChangedCondition("date_run", {"$toDate": "$categories.sample_info.summary.sequence_run_date"}),
                **userChangedCondition("institution", "$categories.sample_info.summary.institution"),
                **userChangedCondition("project_number", "$categories.sample_info.summary.project_no"),
                **userChangedCondition("project_title", "$categories.sample_info.summary.project_title"),
                **userChangedCondition("date_sofi", {"$toDate": "$metadata.created_at"}),
                **userChangedCondition("date_analysis_sofi", {"$toDate": "$metadata.created_at"}),
                **userChangedCondition("qc_detected_species", "$categories.species_detection.summary.detected_species"),
                **userChangedCondition("qc_provided_species", {
                    "$cond": {
                        "if": "$categories.sample_info.summary.provided_species",
                        "then": {"$toString": "$categories.sample_info.summary.provided_species"},
                        "else": "$null"
                    }
                }),
                **userChangedCondition("subspecies", "$categories.serotype.summary.Subspecies"),
                **userChangedCondition("species_final", removeNullProperty(
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
                )),
                **userChangedCondition("sequence_filename", {
                    "$reduce": {
                        "input": "$categories.paired_reads.summary.data",
                        "initialValue": "",
                        "in": {"$concat": ["$$value", "$$this", " "]},
                    }
                }),
                **userChangedCondition("resistance_genes", {
                    "$reduce": {
                        "input": {
                            "$reduce": {
                                "input": {
                                    "$map": {
                                        "input": {"$objectToArray": "$$CURRENT.resistance.report.phenotypes"},
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
                }),
                **userChangedCondition("amr_profile", "$categories.resistance.summary"),
                "resistance": "$categories.resistance",
                **userChangedCondition("resfinder_version", "$categories.resistance.resfinder_version"),
                **userChangedCondition("sero_enterobase", "$categories.serotype.report.enterobase_serotype1"),
                **userChangedCondition("sero_seqsero", "$categories.serotype.report.seqsero_serotype"),
                **userChangedCondition("sero_antigen_seqsero", "$categories.serotype.summary.antigenic_profile"),
                **userChangedCondition("sero_serotype_finder", "$categories.bifrost_sp_ecoli.summary.OH"),
                **userChangedCondition("sero_d_tartrate", "$categories.serotype.summary.D-tartrate_pos10"),
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
                **userChangedCondition("qc_action", "$categories.stamper.stamp.value"),
                **userChangedCondition("qc_ambiguous_sites", "$categories.mapping_qc.summary.snps.x10_10%.snps"),
                **userChangedCondition("qc_unclassified_reads", removeNullProperty(
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
                )),
                **userChangedCondition("qc_db_id", removeNullProperty(
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
                )),
                **userChangedCondition("qc_db_id2", "$categories.species_detection.summary.name_classified_species_2"),
                **userChangedCondition("qc_failed_tests", removeNullProperty(
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
                )),
                **userChangedCondition("qc_genome1x", "$categories.denovo_assembly.summary.length"),
                **userChangedCondition("qc_genome10x", "$categories.mapping_qc.summary.values_at_floor_of_depth.x10.length"),
                **userChangedCondition("qc_gsize_diff1x10", removeNullProperty(
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
                )),
                **userChangedCondition("qc_avg_coverage", "$categories.denovo_assembly.summary.depth"),
                **userChangedCondition("qc_num_contigs", "$categories.denovo_assembly.summary.contigs"),
                **userChangedCondition("qc_num_reads", "$categories.size_check.summary.num_of_reads"),
                **userChangedCondition("trst", "$categories.bifrost_sp_cdiff.summary.TRST"),
                **userChangedCondition("tcda", "$categories.bifrost_sp_cdiff.summary.tcdA"),
                **userChangedCondition("tcdb", "$categories.bifrost_sp_cdiff.summary.tcdB"),
                **userChangedCondition("cdta_cdtb", {
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
                }),
                **userChangedCondition("del_117", "$categories.bifrost_sp_cdiff.summary.117del"),
                **userChangedCondition("a117t", "$categories.bifrost_sp_cdiff.summary.A117T"),
                **userChangedCondition("cdiff_details", "$categories.bifrost_sp_cdiff.summary.cov_info"),
                **userChangedCondition("adhaesion", "$categories.bifrost_sp_ecoli.summary.eae"),
                **userChangedCondition("toxin", "$categories.bifrost_sp_ecoli.summary.stx"),
                **userChangedCondition("toxin_details", "$categories.bifrost_sp_ecoli.summary.verbose"),
                **userChangedCondition("call_percent", "$categories.cgmlst.summary.call_percent"),
                **userChangedCondition("multiple_alleles", "$categories.cgmlst.summary.multiple_alleles"),
                **userChangedCondition("cgmlst_schema", {
                    "$concat": [
                        "$categories.cgmlst.report.schema.name",
                        " (",
                        "$categories.cgmlst.report.schema.digest",
                        ")"
                    ]
                }),
                **userChangedCondition("virulence_genes", {
                    "$concat": [
                        "$categories.bifrost_sp_ecoli.summary.ehx",
                        ",",
                        "$categories.bifrost_sp_ecoli.summary.other",
                    ]
                }),
                **userChangedCondition("bifrost_min_read_check", {
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
                }),
                **userChangedCondition("bifrost_whats_my_species", {
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
                }),
                **userChangedCondition("bifrost_assemblatron", {
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
                }),
                **userChangedCondition("bifrost_assembly_qc", {
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
                }),
                **userChangedCondition("bifrost_ssi_stamper", {
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
                }),
                **userChangedCondition("bifrost_cge_mlst", {
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
                }),
                **userChangedCondition("bifrost_cge_resfinder", {
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
                }),
                **userChangedCondition("bifrost_seqsero", {
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
                }),
                **userChangedCondition("bifrost_enterobase", {
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
                }),
                **userChangedCondition("bifrost_salmonella_subspecies_dtartrate", {
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
                }),
                **userChangedCondition("bifrost_chewbbaca", {
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
                }),
                **userChangedCondition("bifrost_sp_ecoli", {
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
                }),
                **userChangedCondition("bifrost_sp_cdiff", {
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
                }),
                **userChangedCondition("bifrost_amrfinderplus", {
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
                }),
                **userChangedCondition("qc_main_sp_plus_uncl", removeNullProperty(
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
                )),
                **userChangedCondition("qc_final", removeNullProperty(
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
                )),
            },
        },
        {"$set": {"qc_final": "$qc_final.value"}},
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
        {
            "$addFields": {
                **userChangedCondition("serotype_final", {
                    "$switch": {
                        "branches": [
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
                })
            },
        },
        {
            "$set": {
                **userChangedCondition("st_final", {
                    "$cond": {
                        "if": {"$regexMatch": {"input": "$st", "regex": "^\d+$"}},
                        "then": "$st",
                        "else": None,
                    }
                })
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
                                        '$$this.field',
                                        # Replace userchanged condition with userChangedConditionDynamic
                                        userChangedConditionDynamic('$$this.field',
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "amr": {
                                                            "$arrayElemAt": [
                                                                {
                                                                    "$map": {
                                                                        "input": {
                                                                            "$filter": {
                                                                                "input": {
                                                                                    "$objectToArray": "$$CURRENT.resistance.report.phenotypes"
                                                                                },
                                                                                "as": "phenotype",
                                                                                "cond": {
                                                                                    "$eq": [
                                                                                        "$$phenotype.k", "$$this.phenotype"
                                                                                    ]
                                                                                }
                                                                            }
                                                                        },
                                                                        "in": "$$this.v"
                                                                    }
                                                                },
                                                                0
                                                            ]
                                                        }
                                                    },
                                                    "in": {
                                                        "$switch": {
                                                            "branches": [
                                                                {"case": {"$eq": ["$$amr", None]}, "then": "Sensitiv"},
                                                                {"case": {"$eq": ["$$amr", "$null"]}, "then": "Sensitiv"},
                                                                {"case": {"$eq": ["$$amr.genes", "$null"]}, "then": "Sensitiv"},
                                                                {"case": {"$ne": ["$$amr.genes", "$null"]}, "then": "Resistent"}
                                                            ],
                                                            "default": "Sensitiv"
                                                        }
                                                    }
                                                }
                                            }
                                        )
                                    ]
                                }
                            }
                        }, '$$CURRENT'
                    ]
                }
            }
        },
        { "$unset": [ "resistance", "existingData","lookupSofi"] },
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
    print("----- Aggregation pipeline -----")
    print("Note: preserveValues is", preserveValues)
    print("----- Aggregation stages -----")
    print(pipeline)
    print("----- End of pipeline -----")
    return pipeline

def create_userchanged_migration_pipeline():
    """
    Creates a pipeline to set userchanged_ flags for fields that would be overwritten
    by the aggregation pipeline when migrating from a setup without user change tracking.
    Uses the global preserveValues setting to control field preservation.
    """
    global preserveValues

    preserveValues = False

    migration_pipeline = [
        # Run the aggregation pipeline stages (excluding the final merge)
        *agg_pipeline()[:-2],  # Remove the $merge stage
        
        # Compare original vs newly computed values and create userchanged_ flags
        {
            "$addFields": {
                "userchanged_flags": {
                    "$mergeObjects": [
                        # Compare each field that uses userChangedCondition
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.isolate_id", "$isolate_id"]},
                                "then": {"userchanged_isolate_id": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sequence_id", "$sequence_id"]},
                                "then": {"userchanged_sequence_id": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.run_id", "$run_id"]},
                                "then": {"userchanged_run_id": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.date_run", "$date_run"]},
                                "then": {"userchanged_date_run": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.institution", "$institution"]},
                                "then": {"userchanged_institution": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.project_number", "$project_number"]},
                                "then": {"userchanged_project_number": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.project_title", "$project_title"]},
                                "then": {"userchanged_project_title": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.date_sofi", "$date_sofi"]},
                                "then": {"userchanged_date_sofi": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.date_analysis_sofi", "$date_analysis_sofi"]},
                                "then": {"userchanged_date_analysis_sofi": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_detected_species", "$qc_detected_species"]},
                                "then": {"userchanged_qc_detected_species": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.subspecies", "$subspecies"]},
                                "then": {"userchanged_subspecies": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sequence_filename", "$sequence_filename"]},
                                "then": {"userchanged_sequence_filename": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_provided_species", "$qc_provided_species"]},
                                "then": {"userchanged_qc_provided_species": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.species_final", "$species_final"]},
                                "then": {"userchanged_species_final": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.resistance_genes", "$resistance_genes"]},
                                "then": {"userchanged_resistance_genes": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_profile", "$amr_profile"]},
                                "then": {"userchanged_amr_profile": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.resfinder_version", "$resfinder_version"]},
                                "then": {"userchanged_resfinder_version": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sero_enterobase", "$sero_enterobase"]},
                                "then": {"userchanged_sero_enterobase": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sero_seqsero", "$sero_seqsero"]},
                                "then": {"userchanged_sero_seqsero": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sero_antigen_seqsero", "$sero_antigen_seqsero"]},
                                "then": {"userchanged_sero_antigen_seqsero": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sero_serotype_finder", "$sero_serotype_finder"]},
                                "then": {"userchanged_sero_serotype_finder": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.sero_d_tartrate", "$sero_d_tartrate"]},
                                "then": {"userchanged_sero_d_tartrate": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.serotype_final", "$serotype_final"]},
                                "then": {"userchanged_serotype_final": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.st_final", "$st_final"]},
                                "then": {"userchanged_st_final": True},
                                "else": {}
                            }
                        },
                        # All AMR fields
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_ami", "$amr_ami"]},
                                "then": {"userchanged_amr_ami": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_amp", "$amr_amp"]},
                                "then": {"userchanged_amr_amp": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_azi", "$amr_azi"]},
                                "then": {"userchanged_amr_azi": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_fep", "$amr_fep"]},
                                "then": {"userchanged_amr_fep": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_fot", "$amr_fot"]},
                                "then": {"userchanged_amr_fot": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_f_c", "$amr_f_c"]},
                                "then": {"userchanged_amr_f_c": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_fox", "$amr_fox"]},
                                "then": {"userchanged_amr_fox": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_taz", "$amr_taz"]},
                                "then": {"userchanged_amr_taz": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_t_c", "$amr_t_c"]},
                                "then": {"userchanged_amr_t_c": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_chl", "$amr_chl"]},
                                "then": {"userchanged_amr_chl": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_cip", "$amr_cip"]},
                                "then": {"userchanged_amr_cip": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_cli", "$amr_cli"]},
                                "then": {"userchanged_amr_cli": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_col", "$amr_col"]},
                                "then": {"userchanged_amr_col": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_dap", "$amr_dap"]},
                                "then": {"userchanged_amr_dap": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_etp", "$amr_etp"]},
                                "then": {"userchanged_amr_etp": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_ery", "$amr_ery"]},
                                "then": {"userchanged_amr_ery": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_fus", "$amr_fus"]},
                                "then": {"userchanged_amr_fus": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_gen", "$amr_gen"]},
                                "then": {"userchanged_amr_gen": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_imi", "$amr_imi"]},
                                "then": {"userchanged_amr_imi": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_kan", "$amr_kan"]},
                                "then": {"userchanged_amr_kan": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_lzd", "$amr_lzd"]},
                                "then": {"userchanged_amr_lzd": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_mero", "$amr_mero"]},
                                "then": {"userchanged_amr_mero": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_mup", "$amr_mup"]},
                                "then": {"userchanged_amr_mup": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_nal", "$amr_nal"]},
                                "then": {"userchanged_amr_nal": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_pen", "$amr_pen"]},
                                "then": {"userchanged_amr_pen": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_syn", "$amr_syn"]},
                                "then": {"userchanged_amr_syn": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_rif", "$amr_rif"]},
                                "then": {"userchanged_amr_rif": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_str", "$amr_str"]},
                                "then": {"userchanged_amr_str": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_sul", "$amr_sul"]},
                                "then": {"userchanged_amr_sul": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_tei", "$amr_tei"]},
                                "then": {"userchanged_amr_tei": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_trm", "$amr_trm"]},
                                "then": {"userchanged_amr_trm": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_tet", "$amr_tet"]},
                                "then": {"userchanged_amr_tet": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_tia", "$amr_tia"]},
                                "then": {"userchanged_amr_tia": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_tgc", "$amr_tgc"]},
                                "then": {"userchanged_amr_tgc": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_tmp", "$amr_tmp"]},
                                "then": {"userchanged_amr_tmp": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.amr_van", "$amr_van"]},
                                "then": {"userchanged_amr_van": True},
                                "else": {}
                            }
                        },
                        # Add remaining QC and other fields that use userChangedCondition
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_action", "$qc_action"]},
                                "then": {"userchanged_qc_action": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_ambiguous_sites", "$qc_ambiguous_sites"]},
                                "then": {"userchanged_qc_ambiguous_sites": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_unclassified_reads", "$qc_unclassified_reads"]},
                                "then": {"userchanged_qc_unclassified_reads": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_db_id", "$qc_db_id"]},
                                "then": {"userchanged_qc_db_id": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_db_id2", "$qc_db_id2"]},
                                "then": {"userchanged_qc_db_id2": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_failed_tests", "$qc_failed_tests"]},
                                "then": {"userchanged_qc_failed_tests": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_genome1x", "$qc_genome1x"]},
                                "then": {"userchanged_qc_genome1x": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_genome10x", "$qc_genome10x"]},
                                "then": {"userchanged_qc_genome10x": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_gsize_diff1x10", "$qc_gsize_diff1x10"]},
                                "then": {"userchanged_qc_gsize_diff1x10": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_avg_coverage", "$qc_avg_coverage"]},
                                "then": {"userchanged_qc_avg_coverage": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_num_contigs", "$qc_num_contigs"]},
                                "then": {"userchanged_qc_num_contigs": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_num_reads", "$qc_num_reads"]},
                                "then": {"userchanged_qc_num_reads": True},
                                "else": {}
                            }
                        },
                        # C. diff fields
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.trst", "$trst"]},
                                "then": {"userchanged_trst": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.tcda", "$tcda"]},
                                "then": {"userchanged_tcda": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.tcdb", "$tcdb"]},
                                "then": {"userchanged_tcdb": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.del_117", "$del_117"]},
                                "then": {"userchanged_del_117": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.a117t", "$a117t"]},
                                "then": {"userchanged_a117t": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.cdiff_details", "$cdiff_details"]},
                                "then": {"userchanged_cdiff_details": True},
                                "else": {}
                            }
                        },
                        # E. coli fields
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.adhaesion", "$adhaesion"]},
                                "then": {"userchanged_adhaesion": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.toxin", "$toxin"]},
                                "then": {"userchanged_toxin": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.toxin_details", "$toxin_details"]},
                                "then": {"userchanged_toxin_details": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.virulence_genes", "$virulence_genes"]},
                                "then": {"userchanged_virulence_genes": True},
                                "else": {}
                            }
                        },
                        # cgMLST fields
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.call_percent", "$call_percent"]},
                                "then": {"userchanged_call_percent": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.multiple_alleles", "$multiple_alleles"]},
                                "then": {"userchanged_multiple_alleles": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.cgmlst_schema", "$cgmlst_schema"]},
                                "then": {"userchanged_cgmlst_schema": True},
                                "else": {}
                            }
                        },
                        # Bifrost component status fields
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_min_read_check", "$bifrost_min_read_check"]},
                                "then": {"userchanged_bifrost_min_read_check": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_whats_my_species", "$bifrost_whats_my_species"]},
                                "then": {"userchanged_bifrost_whats_my_species": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_assemblatron", "$bifrost_assemblatron"]},
                                "then": {"userchanged_bifrost_assemblatron": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_assembly_qc", "$bifrost_assembly_qc"]},
                                "then": {"userchanged_bifrost_assembly_qc": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_ssi_stamper", "$bifrost_ssi_stamper"]},
                                "then": {"userchanged_bifrost_ssi_stamper": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_cge_mlst", "$bifrost_cge_mlst"]},
                                "then": {"userchanged_bifrost_cge_mlst": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_cge_resfinder", "$bifrost_cge_resfinder"]},
                                "then": {"userchanged_bifrost_cge_resfinder": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_seqsero", "$bifrost_seqsero"]},
                                "then": {"userchanged_bifrost_seqsero": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_enterobase", "$bifrost_enterobase"]},
                                "then": {"userchanged_bifrost_enterobase": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_salmonella_subspecies_dtartrate", "$bifrost_salmonella_subspecies_dtartrate"]},
                                "then": {"userchanged_bifrost_salmonella_subspecies_dtartrate": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_chewbbaca", "$bifrost_chewbbaca"]},
                                "then": {"userchanged_bifrost_chewbbaca": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_sp_ecoli", "$bifrost_sp_ecoli"]},
                                "then": {"userchanged_bifrost_sp_ecoli": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_sp_cdiff", "$bifrost_sp_cdiff"]},
                                "then": {"userchanged_bifrost_sp_cdiff": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.bifrost_amrfinderplus", "$bifrost_amrfinderplus"]},
                                "then": {"userchanged_bifrost_amrfinderplus": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_main_sp_plus_uncl", "$qc_main_sp_plus_uncl"]},
                                "then": {"userchanged_qc_main_sp_plus_uncl": True},
                                "else": {}
                            }
                        },
                        {
                            "$cond": {
                                "if": {"$ne": ["$existingData.qc_final", "$qc_final"]},
                                "then": {"userchanged_qc_final": True},
                                "else": {}
                            }
                        }
                    ]
                }
            }
        },
        
        {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [
                        "$existingData",
                        "$userchanged_flags"
                    ]
                }
            }
        },
        {
           "$merge": {
               "into": "sap_analysis_results",
               "on": "_id",
               "whenMatched": "merge"
           }
        }
    ]

    preserveValues = True  # Reset after migration
    
    return migration_pipeline
