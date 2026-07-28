export const NEW_YEARS_EVE_PRICE_MULTIPLIER = 2;

export function isNewYearsEveNight(isoDate: string): boolean {
  return isoDate.slice(5) === "12-31";
}

export function applyNewYearsEveGuestDirectCents(
  date: string,
  guestDirectCents: number,
  isOverride: boolean,
): { guestDirectCents: number; isNewYearsEve: boolean } {
  if (!isOverride && isNewYearsEveNight(date)) {
    return {
      guestDirectCents: guestDirectCents * NEW_YEARS_EVE_PRICE_MULTIPLIER,
      isNewYearsEve: true,
    };
  }
  return { guestDirectCents, isNewYearsEve: false };
}
