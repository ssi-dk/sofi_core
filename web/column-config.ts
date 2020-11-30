// Column configuration
//
// This file defines which fields are approvable and their relations between one another,
// as well as various properties for controlling how the application handles these fields.
//
// It is helpful when editing to change the file extension to .ts and uncomment the lines below:
//
import { AnalysisResult } from '../app/src/sap-client/models/AnalysisResult';
import { StrictColumn } from '../app/src/app/types';
var typeCheckedColumnConfig: StrictColumn<AnalysisResult>[] =
[
  {
    "fieldName": "qc",
    "approvesWith": ["species_final", "run_id"]
  },
  {
    "fieldName": "st",
    "approvable": true,
    "organization": ["FVST", "SSI"],
    "approvesWith": ["st"]
  },
  {
    "fieldName": "serotype",
    "approvable": true,
    "organization": ["FVST", "SSI"],
    "approvesWith": [
      "serotype_final",
      "subspecies",
      "pathotype",
      "adhesion",
      "toxins"
    ]
  },
  {
    "fieldName": "resistens",
    "approvable": true,
    "organization": ["FVST", "SSI"],
    "approvesWith": ["resistensegener", "amr_profile", "amr..."]
  },
  {
    "fieldName": "cluster",
    "approvable": true,
    "organization": ["FVST", "SSI"],
    "approvesWith": ["cluster_id", "FUDnr"]
  }
]
