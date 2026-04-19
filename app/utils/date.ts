export const formatDate = (isoString: string): string => {
  return isoString.slice(0, 10);
};

export const formatDatetime = (isoString: string): string => {
  return isoString.replace("T", " ").slice(0, 16);
};

export const toDatetimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const nowAsDatetimeLocal = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};
