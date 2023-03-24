import { AnalysisResultAllOfQcFailedTests } from "../../../sap-client";

const transform = (value: any, key: string | number | symbol) => {
  if (!value && value !== 0 && value !== false) {
    return "";
  }
  if (value instanceof Date) {
    try {
      // Fancy libraries could be used, but this will do the trick just fine
      return value.toISOString().split("T")[0];
    } catch (e) {
      if (e instanceof RangeError) {
        // Date can be ill. E.g., `Date(undefined)` is allowed, but ill.
        return value;
      }
    }
  }

  if (key === "qc_failed_tests") {
    if (value instanceof Array && value.length > 0) {
      return "Warning";
    }
  }
  return value;
};

export function convertToCsv<T>(
  data: T[],
  keys: (keyof T)[],
  delimiter: string = ","
) {
  const str = `${keys.map((h) => `${h}${delimiter}`).join("")}\r\n`;

  if (!data || data.length < 0) {
    return str;
  }

  const res = str.concat(
    `${data
      .map(
        (x) =>
          `${keys.map((k) => `${transform(x[k], k)}${delimiter}`).join("")}\r\n`
      )
      .join("")}\r\n`
  );

  return res;
}

export const downloadFile = (
  data: string,
  fileName: string,
  type: string = "text/csv;charset=utf-8;"
) => {
  const blob = new Blob([data], { type });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
