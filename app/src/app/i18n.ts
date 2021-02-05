import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  da: {
    translation: {
      From: "Fra",
      To: "Til",
      Select: "Tilvælg",
      Cancel: "Annullér",
      Found: "Fundet",
      records: "enheder",
      Staging: "Forbereder",
      Approve: "Godkend",
      Reject: "Afvise",
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
      Serotype: "Serotyp",
      ResfinderVersion: "Resfinder version",
      "Save current view": "Gem nuværende view",
      "Delete current view": "Slet nuværende view",
      "Predefined views": "Prædefinerede views",
      "My views": "Mine views",
      Time: "tid",
      "Approved by": "Godkendt af",
      "Revoke approval": "Tilbagekalde godkendelse",
      "My approval history": "Min godkendelseshistorik",
      approvals: "godkendelser",
      "Sign in failed": "Kunne ikke log på",
      "Error message:": "Fejlbesked:",
      "History for isolate": "Historik for isolat ID:",
      Logout: "Log ud",
      Microbiologist: "Mikrobiolog",
      User: "Bruger",
      Level: "Niveau",

      received_date: "Modtagedato",
      sampling_date: "Prøvetagningsdato",
      institution: "Institution",
      project_title: "Projekt titel",
      project_number: "Projekt nr",
      provided_species: "Provided species",
      run_id: "RunID",
      isolate_id: "IsolatID",
      fud_number: "Fud nr",
      cluster_id: "ClusterID",
      serotype_final: "Serotyp final",
      st: "ST"
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "da",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safe from xss
    },
  });

export default i18n;
