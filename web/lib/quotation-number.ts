type QuotationNumberRecord = {
  quotationNumber?: string | null;
};

export function nextQuotationNumber(
  quotations: QuotationNumberRecord[],
  date = new Date(),
) {
  const year = date.getFullYear();
  const pattern = new RegExp(`^Q-${year}-(\\d+)$`);
  let highestSequence = 0;

  for (const quotation of quotations) {
    const match = pattern.exec(quotation.quotationNumber?.trim() ?? "");
    if (!match) continue;

    highestSequence = Math.max(highestSequence, Number(match[1]));
  }

  return `Q-${year}-${String(highestSequence + 1).padStart(4, "0")}`;
}
