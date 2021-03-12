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

agg_pipeline = [
    {
        "$project": {
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
        },
    },
    {"$merge": {"into": "sap_analysis_results", "on": "_id", "whenMatched": "merge"}},
]
