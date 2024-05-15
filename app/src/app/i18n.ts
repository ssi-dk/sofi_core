import { template } from "@babel/core";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { AnalysisResult } from "sap-client";
import { isTemplateExpression } from "typescript";
import { invertMap } from "utils";

/**
 * This configuration controls the display names for individual fields.
 * Top-level keys "da", "en", etc. are for different language codes.
 * Underneath each language code is a set of key-value pairs, where the
 * left-side is the internal name of the field and the right side is the
 * desired field display name for the language.
 */
const fieldDisplayNames = {
  da: {
    public_number: "Acc_nr",
    received_date: "Modtagedato",
    sampling_date: "Prøvetagningsdato",
    institution: "Institution",
    project_title: "Projekt_titel",
    project_number: "Projekt_nr",
    provided_species: "Provided_species",
    animal_species: "Dyreart",
    run_id: "RunID",
    isolate_id: "IsolatID",
    fud_number: "Fud_nr",
    cluster_id: "ClusterID",
    serotype_final: "Serotype_final",
    st: "ST",
    infection_source: "Smittekilde",
    comment_cluster: "Kommentar_cluster",
    comment_general: "Kommentar_generelt",
  },
  en: {
    id: "ID",
    isolate_id: "Isolate_ID",
    sequence_id: "Sequence_ID",
    sequence_filename: "Sequence_files",
    institution: "Institution",
    project_number: "Project_no",
    project_title: "Project_title",
    date_sample: "Date_sample",
    date_received: "Date_received",
    run_id: "Run_ID",
    public_number: "Acc_no.",
    provided_species: "QC_provided_species",
    chr_number: "CHR_no.",
    aut_number: "Aut_no.",
    product_type: "Product_type",
    product: "Product",
    origin_country: "Origin",
    animal_species: "Animal",
    sample_info: "Info_sample",
    cpr_nr: "CPR_no.",
    gender: "M/F",
    name: "Name",
    age: "Age",
    primary_isolate: "Primary_isolate",
    travel: "Travel",
    travel_country: "Travel_origin",
    date_run: "Date_run",
    date_received_kma: "Date_received_KMA",
    kma: "KMA",
    fud_number: "FUD_no.",
    cluster_id: "Cluster_ID",
    date_epi: "Date_Epi",
    region: "KMA_region",
    infection_source: "Outbreak_source",
    date_sofi: "Date_SOFI",
    qc_detected_species: "QC_detected_species",
    species_final: "Species_final",
    subspecies: "Subspecies",
    serotype_final: "Serotype_final",
    sero_enterobase: "Sero_enterobase",
    sero_seqsero: "Sero_seqSero",
    sero_antigen_seqzero: "Sero_antigen_seqSero",
    sero_d_tartrate: "Sero_D-tartrate",
    sero_serotype_finder: "Sero_serotype_finder",
    st: "ST",
    st_final: "ST_final",
    st_alleles: "ST_alleles",
    pathotype_final: "Pathotype_final",
    virulence_genes: "Virulence_genes",
    adhesion_final: "Adheasion_final",
    toxins_final: "Toxin_final",
    resistance_genes: "Resistance_genes",
    amr_profile: "AMR_profile",
    amr_ami: "AMR_Ami",
    amr_amp: "AMR_Amp",
    amr_azi: "AMR_Azi",
    amr_fep: "AMR_Fep",
    amr_fot: "AMR_Fot",
    amr_f_c: "AMR_F/C",
    amr_fox: "AMR_Fox",
    amr_taz: "AMR_Taz",
    amr_t_c: "AMR_T/C",
    amr_chl: "AMR_Chl",
    amr_cip: "AMR_Cip",
    amr_cli: "AMR_Cli",
    amr_col: "AMR_Col",
    amr_dap: "AMR_Dap",
    amr_etp: "AMR_Etp",
    amr_ery: "AMR_Ery",
    amr_fus: "AMR_Fus",
    amr_gen: "AMR_Gen",
    amr_imi: "AMR_Imi",
    amr_kan: "AMR_Kan",
    amr_lzd: "AMR_Lzd",
    amr_mero: "AMR_Mero",
    amr_mup: "AMR_Mup",
    amr_nal: "AMR_Nal",
    amr_pen: "AMR_Pen",
    amr_syn: "AMR_Syn",
    amr_rif: "AMR_Rif",
    amr_str: "AMR_Str",
    amr_sul: "AMR_Sul",
    amr_tei: "AMR_Tei",
    amr_trm: "AMR_Trm",
    amr_tet: "AMR_Tet",
    amr_tia: "AMR_Tia",
    amr_tgc: "AMR_Tgc",
    amr_tmp: "AMR_Tmp",
    amr_van: "AMR_Van",
    resfinder_version: "ResFinder_version",
    date_analysis_sofi: "Date_analysis_SOFI",
    date_approved_serotype: "Date_approved_serotype",
    date_approved_qc: "Date_approved_QC",
    date_approved_amr: "Date_approved_AMR",
    date_approved_st: "Date_approved_ST",
    date_approved_toxin: "Date_approved_toxin",
    date_approved_cluster: "Date_approved_cluster",
    comment_supplementary: "Comments_supplementary",
    comment_cluster: "Comments_cluster",
    comment_general: "Comments_general",
    comment: "Comments",
    qc_final: "QC_final",
    comment_qc: "Comments_QC",
    qc_provided_species: "QC_provided_species",
    qc_genome1x: "QC_genome1x",
    qc_genome10x: "QC_genome10x",
    qc_gsize_diff1x10: "QC_Gsize_diff1x10",
    qc_avg_coverage: "QC_avg_coverage",
    qc_num_contigs: "QC_num_contigs",
    qc_ambiguous_sites: "QC_ambiguous_sites",
    qc_num_reads: "QC_num_reads",
    qc_main_sp_plus_uncl: "QC_main_sp_plus_uncl",
    qc_unclassified_reads: "QC_unclassified_reads",
    qc_db_id: "QC_DB_ID",
    qc_db_id2: "QC_DB_ID2",
    qc_failed_tests: "QC_failed_tests",
    qc_cgmlst_percent: "QC_cgMLST%",
    cgmlst_schema_salmonella: "cgMLST skema Salmonella",
    cgmlst_schema_ecoli: "cgMLST skema E. coli",
    cgmlst_schema_campylobacter: "cgMLST skema Campylobacter",
    cgmlst_schema_listeria: "cgMLST skema Listeria",
    cgmlst_schema_klebsiella: "cgMLST skema Klebsiella",
  } as { [key in keyof AnalysisResult]: string },
};

const analysisType: AnalysisResult = {} as AnalysisResult;

/**
 * Same as fieldDisplayNames, but for all other portions of the UI.
 */
const resources = {
  da: {
    translation: {
      From: "Fra",
      To: "Til",
      Select: "Tilvælg",
      Cancel: "Annullér",
      Return: "Tilbage",
      Found: "Fundet",
      records: "enheder",
      Staging: "Forbereder",
      Approve: "Godkend",
      Reject: "Afvis",
      "Approval submitted": "Godkendelse indsendt",
      "Rejection submitted": "Afvising indsendt",
      "have been submitted for approval.": "er blevet registeret som godkendt.",
      "have been rejected.": "er blevet afvist.",
      MetadataFilter: "Metadata filter",
      AnalysisFilter: "Analyse filter",
      Organisation: "Organisation",
      Project: "Projekt",
      Species: "Dyreart",
      Agens: "Agens",
      Serotype: "Serotype",
      ResfinderVersion: "Resfinder version",
      "Save current view": "Gem nuværende view",
      "Delete current view": "Slet nuværende view",
      "Predefined views": "Prædefinerede views",
      "My views": "Mine views",
      Time: "Tid",
      Sequences: "Sekvenser",
      "Approved by": "Godkendt af",
      "Revoke approval": "Tilbagekald godkendelse",
      "My approval history": "Min godkendelseshistorik",
      "Analysis results": "Analyseresultater",
      approvals: "godkendelser",
      "Sign in failed": "Kunne ikke log på",
      "Error message:": "Fejlbesked:",
      "History for isolate": "Historik for isolat ID:",
      Logout: "Log ud",
      Microbiologist: "Mikrobiolog",
      User: "Bruger",
      Level: "Niveau",
      Update: "Opdater",
      Reload: "Genindlæs",
      Load: "Indlæs",
      Loading: "Indlæser",
      Close: "Luk",
      MetadataReloaded: "Metadata genindlæst",
      IsolateMetadataReloadedFor: "Genindlæst metadata for isolat",
      MetadataNotReloaded: "Metadata ikke genindlæst",
      IsolateMetadataNotReloadedFor:
        "Grundet fejl er metadata ikke genindlæst for isolat",
      // field name translations
      ...fieldDisplayNames.da,
    },
  },
  en: {
    translation: {
      // field name translations
      ...fieldDisplayNames.en,
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    //debug: true, // prints translation misses to the console

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already does xss escapes
    },
  });

/**
 * Get the display name of a field given its internal name
 * @param internalName the internal name of the field
 * @param lang i18n lng code to translate displayName to. Defaults to current language
 */
export const getFieldDisplayName = (
  internalName: string,
  lang?: string | undefined
) => {
  const lng = lang ?? i18n.language;
  return fieldDisplayNames[lng][internalName];
};

const flippedFieldMap = Object.keys(fieldDisplayNames)
  .map((x) => ({ key: x, value: invertMap(fieldDisplayNames[x], true) }))
  .reduce((obj, item) => (obj[item.key] = item.value) && obj, {});

/**
 * Get the internal name of a field given its displayName
 * @param displayName the display name of the field. Case insensitive
 * @param lang i18n lng code to translate displayName from. Defaults to current language
 */
export const getFieldInternalName = (
  displayName: string,
  lang?: string | undefined
) => {
  const lng = lang ?? i18n.language;
  return flippedFieldMap[lng][displayName.toLocaleLowerCase()];
};

export default i18n;
