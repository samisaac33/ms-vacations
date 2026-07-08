import { PaymentSuccessClient } from "./payment-success-client";

type Props = {
  searchParams: Promise<{
    provider?: string;
    bookingId?: string;
    token?: string;
  }>;
};

export default async function ReservaExitoPage(props: Props) {
  const { provider, bookingId, token } = await props.searchParams;

  return (
    <PaymentSuccessClient
      provider={provider ?? null}
      bookingId={bookingId ?? null}
      paypalOrderId={token ?? null}
    />
  );
}
