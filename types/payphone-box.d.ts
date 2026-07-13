type PayPhonePaymentBoxConfig = {
  token: string;
  storeId: string;
  clientTransactionId: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax?: number;
  tax?: number;
  service?: number;
  tip?: number;
  currency?: string;
  reference?: string;
  lang?: string;
  email?: string;
  defaultMethod?: "card" | "payphone";
  timeZone?: number;
  showMainButton?: boolean;
  showPaymentMethodSelector?: boolean;
  showFooter?: boolean;
  customButtonId?: string;
};

type PayPhonePaymentBoxInstance = {
  render: (containerId: string) => void;
  startProcessPayment: () => void;
};

declare class PPaymentButtonBox {
  constructor(config: PayPhonePaymentBoxConfig);
  render(containerId: string): void;
  startProcessPayment(): void;
}

interface Window {
  PPaymentButtonBox?: typeof PPaymentButtonBox;
}
