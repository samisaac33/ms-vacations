export type BankAccountDetails = {
  holder: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  idType: string;
  idNumber: string;
  email?: string;
};

export function getBankAccountDetails(): BankAccountDetails | null {
  const holder = process.env.BANK_ACCOUNT_HOLDER;
  const bankName = process.env.BANK_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
  const accountType = process.env.BANK_ACCOUNT_TYPE;
  const idType = process.env.BANK_ID_TYPE;
  const idNumber = process.env.BANK_ID_NUMBER;
  if (!holder || !bankName || !accountNumber || !accountType || !idType || !idNumber) {
    return null;
  }
  return {
    holder,
    bankName,
    accountNumber,
    accountType,
    idType,
    idNumber,
    email: process.env.BANK_EMAIL,
  };
}

export function formatBookingReference(bookingId: string): string {
  return bookingId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
