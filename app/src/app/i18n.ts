import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  da: {
    translation: {
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
      Projekt: "Projekt",
      Modtagedato: "Modtagedato",
      Dyreart: "Dyreart",
      Agens: "Agens",
      Serotyp: "Serotyp",
      ResfinderVersion: "Resfinder version",
      "Save current view": "Gem nuværende view",
      "Predefined views": "Prædefinerede views",
      "My views": "Mine views",
      Time: "tid",
      "Approved by": "Godkendt af",
      "Revoke approval": "Tilbagekalde godkendelse",
      "My approval history": "Mine godkendelse historik",
      approvals: "godkendelser",
      sampling_date: "Prøvetagningsdato"
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
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
