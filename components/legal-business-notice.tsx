import { formatBusinessIdentification, getBusinessInfo } from "@/lib/legal/business";

export function LegalBusinessNotice() {
  const business = getBusinessInfo();
  const id = formatBusinessIdentification(business);

  return (
    <p className="mt-4 rounded-xl border border-sand-dark bg-sand/50 px-4 py-3 text-sm text-muted">
      <span className="font-medium text-ink">Titular: </span>
      {id || business.legalName}
      {business.address ? (
        <>
          {" "}
          · <span className="text-ink">{business.address}</span>
        </>
      ) : null}
    </p>
  );
}
