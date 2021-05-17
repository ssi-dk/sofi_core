const coerce = (x: any) => {
  if (!x && x !== 0 && x !== false) {
    return "";
  }
  return x;
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
        (x) => `${keys.map((k) => `${coerce(x[k])}${delimiter}`).join("")}\r\n`
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
