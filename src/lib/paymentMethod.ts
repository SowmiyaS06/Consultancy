import type { PaymentMethod } from "@/lib/storeApi";

export const PAYMENT_METHOD_VALUES: PaymentMethod[] = [
  "cod",
  "upi",
  "card",
  "netbanking",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  upi: "UPI Payment",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: "cod",
    label: PAYMENT_METHOD_LABELS.cod,
    description: "Pay when your order arrives",
  },
  {
    value: "upi",
    label: PAYMENT_METHOD_LABELS.upi,
    description: "Pay online using any UPI app",
  },
  {
    value: "card",
    label: PAYMENT_METHOD_LABELS.card,
    description: "Pay online using Visa, MasterCard, RuPay",
  },
  {
    value: "netbanking",
    label: PAYMENT_METHOD_LABELS.netbanking,
    description: "Pay online from your bank account",
  },
];

export const getPaymentMethodLabel = (
  paymentMethod?: string | null,
  fallback = "-",
) => {
  if (!paymentMethod) return fallback;

  const normalized = paymentMethod.toLowerCase();
  if (normalized in PAYMENT_METHOD_LABELS) {
    return PAYMENT_METHOD_LABELS[normalized as PaymentMethod];
  }

  return paymentMethod.toUpperCase();
};
