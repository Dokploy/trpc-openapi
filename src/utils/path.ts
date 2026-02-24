export const normalizePath = (path: string) => {
  return `/${path.replace(/^\/|\/$/g, '')}`;
};

export const getPathParameters = (path: string): string[] => {
  return Array.from(path.matchAll(/\{(.+?)\}/g)).map(([, key]) => key!);
};

export const getPathRegExp = (path: string) => {
  const groupedExp = path.replace(/\{(.+?)\}/g, (_, key: string) => `(?<${key}>[^/]+)`);
  return new RegExp(`^${groupedExp}$`, 'i');
};
