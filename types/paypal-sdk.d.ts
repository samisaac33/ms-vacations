type PayPalButtonsInstance = {
  render: (selector: string) => Promise<void>;
};

type PayPalOnApproveData = {
  orderID: string;
};

type PayPalButtonsConfig = {
  style?: { layout?: string; color?: string; shape?: string; label?: string };
  createOrder: () => Promise<string>;
  onApprove: (data: PayPalOnApproveData) => Promise<void>;
  onError?: (error: unknown) => void;
};

interface PayPalNamespace {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtonsInstance;
}

interface Window {
  paypal?: PayPalNamespace;
}
