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
                "isolate_id": "$categories.sample_info.summary.sample_name",
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
                "resistance": "$categories.resistance",
                "resfinder_version": "$categories.resistance.resfinder_version",
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
                "trst": "$categories.bifrost_sp_cdiff.summary.TRST",
                "tcda": "$categories.bifrost_sp_cdiff.summary.tcdA",
                "tcdb": "$categories.bifrost_sp_cdiff.summary.tcdB",
                "cdta_cdtb": "$categories.bifrost_sp_cdiff.summary.cdtA/B",
                "del117": "$categories.bifrost_sp_cdiff.summary.117del",
                "a117t": "$categories.bifrost_sp_cdiff.summary.A117T",
                "cdiff_details": "$categories.bifrost_sp_cdiff.summary.tcdA:tcdB:tcdC:cdtA:cdtB",                
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
                                            '$let': {
                                                'vars': {
                                                    'amr': {
                                                        '$arrayElemAt': [{
                                                        # '$first': {
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
                                    ]
                                }
                            }
                        }, '$$CURRENT'
                    ]
                }
            }
        },
        { "$unset": [ "resistance" ] },
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
