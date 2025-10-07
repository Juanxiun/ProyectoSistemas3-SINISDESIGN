export const datetime = (dat: string) => {
  let inicio = dat;
  inicio = inicio.replace("T", " ");

  if (!inicio.includes(":")) {
    inicio + ":00";
  } else if (inicio.split(":")[0].length == 2) {
    inicio += ":00";
  }

  return inicio;
};

export const formatDateTime = (datetime: string): string => {
  const date = new Date(datetime);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("es-BO", options);
}
