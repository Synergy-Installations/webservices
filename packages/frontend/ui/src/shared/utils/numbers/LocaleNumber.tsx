export const formatLocaleNumberToUniNumber = (value: string, locale: string) => {
  const groupSeparator = locale === "de-DE" ? "." : ",";
  const decimalSeparator = locale === "de-DE" ? "," : ".";

  const normalizedValue = value
    .split(groupSeparator)
    .join("") // Remove group separators
    .split(decimalSeparator)
    .join("."); // Replace decimal separator with "."

  return parseFloat(normalizedValue);
};