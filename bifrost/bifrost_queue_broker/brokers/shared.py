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
        "Dato_proeve ": "sampling_date",
        "Dato_proeve": "sampling_date",
        "Dato_modtagelse": "received_date",
        "RunID": "run_id",
        "Acc_nr": "public",
        "QC_provided_species": "provided_species",
        "QC_final": "qc_final",
        "ST": "st",
        "Serotype_final": "serotype_final",
        "Primaert_iso": "primary_isolate",
        "Dato_modtagelse": "received_date",
        "CHR": "chr_number",
        "CVR": "cvr_number",
        "Aut_nr": "aut_number",
        "Produkt_type": "product_type",
        "Produkt": "product",
        "Oprindelsesland": "origin_country",
        "Dyreart": "animal_species",
        "Proeveinfo": "sample_info",
        "Dato_analyseSAP": "date_analysis_sofi",
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
    }
)

reverse_lims_column_mapping = immutable_dict(
    (v, k) for k, v in lims_column_mapping.items()
)

tbr_column_mappings = immutable_dict(
    {
        "serotype": "serotype_final",
        "st": "st",
        "clusterId": "cluster_id",
        "test_date": "run_date",
        "kma_date": "kma_received_date",
        "kma_name": "kma",
        "fud_nr": "fud_number",
        "fudNr": "fud_number",
        "species": "qc_provided_species",
        "subspecies": "subspecies",
        "pathotype": "pathotype_final",
        "adheasion": "adhesion_final",
        "toxin": "toxins_final",
        "resistensgener": "resistance_genes",
        "ssi_date": "received_date",
        "dateEpi": "date_epi",
        "dateApprovedResistens": "date_approved_amr",
        "dateApprovedSerotype": "date_approved_serotype",
        "dateApprovedQC": "date_approved_qc",
        "dateApprovedST": "date_approved_st",
        "dateApprovedCluster": "date_approved_cluster",
        "dateApprovedToxin": "date_approved_toxin",
        # TBR AMR mappings
        "amrProfile": "amr_profile",
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

reverse_tbr_column_mapping = immutable_dict(
    (v, k) for k, v in tbr_column_mappings.items()
)
