import os
from common.queue import ProcessingStatus
from common.database import yield_chunks


class BrokerError(Exception):
    """Thrown when a broker encounters an error."""

    pass


class immutable_dict(dict):
    def __init__(self, *args, **kwargs):
        super(immutable_dict, self).__init__(*args, **kwargs)

    def __getitem__(self, key):
        # val = dict.__getitem__(self, key)
        val = self.get(key, key)
        return val

    def normal_get(self, key):
        val = dict.get(self, key, None)
        return val

    def __setitem__(self, key, val):
        pass


lims_column_mapping = immutable_dict(
    {
        # LIMS mapping
        "isolateId": "isolate_id",
        "SekvensId": "sequence_id",
        "Sekvensfilnavn": "sequence_filename",
        "Projektnr": "project_number",
        "Projekttitel": "project_title",
        # LIMS api returns a space after Dato_proeve currently.
        "Dato_proeve ": "date_sample",
        "Dato_proeve": "date_sample",
        "Dato_modtagelse": "date_received",
        "RunID": "run_id",
        "Acc_nr": "public_number",
        "QC_provided_species": "provided_species",
        "QC_final": "qc_final",
        "ST": "st_final",
        "Species_final": "species_final",
        "Subspecies": "subspecies",
        "Adheasion_final": "adhesion_final",
        "Serotype_final": "serotype_final",
        "Pathotype_final": "pathotype_final",
        "Toxin_final": "toxins_final",
        "Primaert_iso": "primary_isolate",
        "Dato_modtagelse": "date_received",
        "CHR": "chr_number",
        "CVR": "cvr_number",
        "Aut_nr": "aut_number",
        "Produkt_type": "product_type",
        "Produkt": "product",
        "Oprindelsesland": "origin_country",
        "Dyreart": "animal_species",
        "Proeveinfo": "sample_info",
        "Dato_analyseSAP": "date_analysis_sofi",
        "ResfinderVersion": "resfinder_version",
        # LIMS resistances
        "AMR_profil": "amr_profil",
        "AMR _ Ami": "amr_ami",
        "AMR _ Amp": "amr_amp",
        "AMR _ Azi": "amr_azi",
        "AMR _ Fep": "amr_fep",
        "AMR _ Fot": "amr_fot",
        "AMR _ F/C": "amr_f/c",
        "AMR _ Fox": "amr_fox",
        "AMR _ Taz": "amr_taz",
        "AMR _ T/C": "amr_t/c",
        "AMR _ Chl": "amr_chl",
        "AMR _ Cip": "amr_cip",
        "AMR _ Cli": "amr_cli",
        "AMR _ Col": "amr_col",
        "AMR _ Dap": "amr_dap",
        "AMR _ Etp": "amr_etp",
        "AMR _ Ery": "amr_ery",
        "AMR _ Fus": "amr_fus",
        "AMR _ Gen": "amr_gen",
        "AMR _ Imi": "amr_imi",
        "AMR _ Kan": "amr_kan",
        "AMR _ Lzd": "amr_lzd",
        "AMR _ Mero": "amr_mero",
        "AMR _ Mup": "amr_mup",
        "AMR _ Nal": "amr_nal",
        "AMR _ Pen": "amr_pen",
        "AMR _ Syn": "amr_syn",
        "AMR _ Rif": "amr_rif",
        "AMR _ Str": "amr_str",
        "AMR _ Sul": "amr_sul",
        "AMR _ Tei": "amr_tei",
        "AMR _ Trm": "amr_trm",
        "AMR _ Tet": "amr_tet",
        "AMR _ Tia": "amr_tia",
        "AMR _ Tgc": "amr_tgc",
        "AMR _Tmp ": "amr_tmp",
        "AMR _ Van": "amr_van",
        # They're written inconsistently sometimes :/
        "AMR_Ami": "amr_ami",
        "AMR_Amp": "amr_amp",
        "AMR_Azi": "amr_azi",
        "AMR_Fep": "amr_fep",
        "AMR_Fot": "amr_fot",
        "AMR_F/C": "amr_f/c",
        "AMR_Fox": "amr_fox",
        "AMR_Taz": "amr_taz",
        "AMR_T/C": "amr_t/c",
        "AMR_Chl": "amr_chl",
        "AMR_Cip": "amr_cip",
        "AMR_Cli": "amr_cli",
        "AMR_Col": "amr_col",
        "AMR_Dap": "amr_dap",
        "AMR_Etp": "amr_etp",
        "AMR_Ery": "amr_ery",
        "AMR_Fus": "amr_fus",
        "AMR_Gen": "amr_gen",
        "AMR_Imi": "amr_imi",
        "AMR_Kan": "amr_kan",
        "AMR_Lzd": "amr_lzd",
        "AMR_Mero": "amr_mero",
        "AMR_Mup": "amr_mup",
        "AMR_Nal": "amr_nal",
        "AMR_Pen": "amr_pen",
        "AMR_Syn": "amr_syn",
        "AMR_Rif": "amr_rif",
        "AMR_Str": "amr_str",
        "AMR_Sul": "amr_sul",
        "AMR_Tei": "amr_tei",
        "AMR_Trm": "amr_trm",
        "AMR_Tet": "amr_tet",
        "AMR_Tia": "amr_tia",
        "AMR_Tgc": "amr_tgc",
        "AMR_Tmp": "amr_tmp",
        "AMR_Van": "amr_van",
    }
)

reverse_lims_column_mapping = immutable_dict(
    (v, k) for k, v in lims_column_mapping.items()
)

tbr_to_sofi_column_mapping = immutable_dict(
    {
        "ssi_date": "date_received",
        "test_date": "date_sample",
        "kma_name": "kma",
        "kma_date": "date_received_kma",
        "cpr_nr": "cpr_nr",
        "primary_isolate": "primary_isolate",
        "gender": "gender",
        "age": "age",
        "travel_country": "travel_country",
        "region": "region",
        "travel": "travel",
    }
)

sofi_to_tbr_column_mapping = immutable_dict(
    {
        "serotype": "serotype_final",
        "st": "st_final",
        "cluster_id": "cluster_id",
        "run_id": "run_id",
        "fud_nr": "fud_number",
        "date_epi": "date_epi",
        "species": "species_final",
        "subspecies": "subspecies",
        "pathotype": "pathotype_final",
        "adheasion": "adhesion_final",
        "toxin": "toxins_final",
        "resistensgener": "resistance_genes",
        "resfinder_version": "resfinder_version",
        "date_approved_resistens": "date_approved_amr",
        "date_approved_serotype": "date_approved_serotype",
        "date_approved_qc": "date_approved_qc",
        "date_approved_st": "date_approved_st",
        "date_approved_cluster": "date_approved_cluster",
        "date_approved_toxin": "date_approved_toxin",
        # TBR AMR mappings
        "amr_profile": "amr_profile",
        "amikacin": "amr_ami",
        "ampicillin": "amr_amp",
        "azithromycin": "amr_azi",
        "cefepime": "amr_fep",
        "cefotaxime": "amr_fot",
        "cefotaxime_clavulanat": "amr_f_c",
        "cefoxitin": "amr_fox",
        "ceftazidime": "amr_taz",
        "ceftazidime_clavulanat": "amr_t_c",
        "chloramphenicol": "amr_chl",
        "ciprofloxacin": "amr_cip",
        "clindamycin": "amr_cli",
        "colistin": "amr_col",
        "daptomycin": "amr_dap",
        "ertapenem": "amr_etp",
        "erythromycin": "amr_ery",
        "fusidinsyre": "amr_fus",
        "gentamicin": "amr_gen",
        "imipenem": "amr_imi",
        "kanamycin": "amr_kan",
        "linezolid": "amr_lzd",
        "meropenem": "amr_mero",
        "mupirocin": "amr_mup",
        "nalidixan": "amr_nal",
        "penicillin": "amr_pen",
        "ceftazidime_clavulanatn": "amr_syn",
        "rifampin": "amr_rif",
        "streptomycin": "amr_str",
        "sulfamethoxazole": "amr_sul",
        "teicoplanin": "amr_tei",
        "temocilin": "amr_trm",
        "tetracyklin": "amr_tet",
        "tiamulin": "amr_tia",
        "tigecycline": "amr_tgc",
        "trimethoprim": "amr_tmp",
        "vancomycin": "amr_van",
    }
)

reverse_tbr_to_sofi_column_mapping = immutable_dict(
    (v, k) for k, v in tbr_to_sofi_column_mapping.items()
)

reverse_sofi_to_tbr_column_mapping = immutable_dict(
    (v, k) for k, v in sofi_to_tbr_column_mapping.items()
)
