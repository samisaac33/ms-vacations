import { PaymentSuccessClient } from "./payment-success-client";

type Props = {
  searchParams: Promise<{
    provider?: string;
    bookingId?: string;
    token?: string;
    id?: string;
    clientTransactionId?: string;
  }>;
};

export default async function ReservaExitoPage(props: Props) {
  const { provider, bookingId, token, id, clientTransactionId } = await props.searchParams;

  return (
    <PaymentSuccessClient
      provider={provider ?? null}
      bookingId={bookingId ?? clientTransactionId ?? null}
      paypalOrderId={token ?? null}
      payphoneTransactionId={id ?? null}
      payphoneClientTransactionId={clientTransactionId ?? null}
    />
  );
}
