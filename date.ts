export const getPolishWeekDay = (date: Date) => {
  return date.toLocaleDateString("pl-PL", { weekday: "long" });
};
