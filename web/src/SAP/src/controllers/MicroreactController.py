import sys
import os
from flask import abort
from flask.json import jsonify
from .....microreact_integration.functions import new_project as new_microreact_project
from ..repositories.workspaces import get_workspace as get_workspace_db
from web.src.SAP.src.security.permission_check import (authorized_columns)

def send_to_microreact(user, token_info, body):
    ws_id = body.workspace 
    ws = get_workspace_db(user, ws_id)
     
    authorized = authorized_columns(token_info)
    print(authorized, file=sys.stderr)
    print(ws["samples"], file=sys.stderr)

    values = []
    for sample in ws["samples"] :
        row = []
        for column in authorized :
            ## Dette må kunne gøres smartere ved automatisk at benytte tabellen sap_analysis_results, 
            ## til at beskrive hvilke rækker som skal medtages/fravælges:
            if column not in [ 
                "project_number", 
                "project_title", 
                "date_sample", 
                "date_received", 
                "public_number",
                "primary_isolate",
                "chr_number",
                "cvr_number",
                "aut_number",
                "product_type",
                "product",
                "origin_country",
                "animal_species",
                "sample_info",
                "date_received_kma",
                "region",
                "fud_number",
                "cluster_id",
                "date_epi",
                "resfinder_version",
                "date_approved_serotype",
                "date_approved_qc",
                "date_approved_amr",
                "date_approved_st",
                "date_approved_toxin",
                "date_approved_cluster",
                "qc_provided_species",
                "qc_cgmlst_percent",
                "species_final",
                "pathotype",
                "pathotype_final",
                "sero_enterobase",
                "sero_seqsero",
                "sero_antigen_seqsero",
                "sero_serotype_finder",
                "serotype_final",
                "adhesion_final",
                "virulence_genes",
                "toxins_final",
                "infection_source",
                "amr_profile",
                "comment",
                "comment_cluster",
                "comment_supplementary",
                "comment_qc",
                "cgmlst_schema_salmonella",
                "cgmlst_schema_ecoli",
                "cgmlst_schema_campylobacter",
                "cgmlst_schema_listeria",
                "cgmlst_schema_klebsiella"
                ]:
                row.append(sample[column])
        values.append(row)

    print(values, file=sys.stderr)
    

    res = new_microreact_project(        
        project_name=ws["name"],
        tree_calcs=[],
        metadata_keys=authorized,
        metadata_values=values,
        mr_access_token=body.mr_access_token,
        mr_base_url="http://microreact:3000/"
        )

    return jsonify(res.json())
