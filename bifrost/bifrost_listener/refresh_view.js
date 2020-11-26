cursor = db.sample_components.find();

refreshSAPAnalysisResults = function () {
  db.samples.aggregate([
    {
      $project: {
        "QC_provided_species": "$properties.stamper.summary.test__sample__species_provided_is_detected.value",
        "QC_genome1x": "$properties.stamper.summary.test__denovo_assembly__genome_size_at_1x.value",
        "QC_genome10x": "$properties.stamper.summary.test__denovo_assembly__genome_size_at_10x.value",
        "QC_Gsize_diff1x10": "$properties.stamper.summary.test__denovo_assembly__genome_size_difference_1x_10x.value",
        "QC_Avg_coverage": "$properties.stamper.summary.test__denovo_assembly__genome_average_coverage.value"
      }
    },
    { $merge: { into: "sap_analysis_results" } } //, whenMatched: "replace" } }
  ]);
};

refreshSAPAnalysisResults();