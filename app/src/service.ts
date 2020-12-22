export const getUrl = (path: string) =>
  `${window.location.protocol}//${window.location.host}/api${path}`;
