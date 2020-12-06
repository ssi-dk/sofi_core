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
      "Approval submitted": "Godkendelse indsendt",
      "have been submitted for approval.": "er blevet registeret som godkendt.",
      MetadataFilter: "Metadata filter",
      AnalysisFilter: "Analyse filter",
      Prøvetagningsdato: "Prøvetagningsdato",
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
