import { formatPrice } from "@/lib/format";

export type MpItem = {
  id: string | number;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "ARS";
  picture_url?: string;
};

export type MpBackUrls = {
  success: string;
  pending: string;
  failure: string;
};

export function mpConfigured(): boolean {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

/**
 * Crea una preferencia de Checkout Pro en Mercado Pago.
 * Devuelve el init_point (URL de pago) o null si no hay token cargado.
 */
export async function createPreference(options: {
  items: MpItem[];
  backUrls: MpBackUrls;
  externalReference: string;
  notificationUrl?: string;
  payer?: { name?: string; email?: string; phone?: string };
  statementDescriptor?: string;
}): Promise<{ id: string; initPoint: string } | null> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return null;

  const body: Record<string, unknown> = {
    items: options.items,
    back_urls: options.backUrls,
    external_reference: options.externalReference,
    auto_return: "approved",
    statement_descriptor: options.statementDescriptor ?? "GENITRINI HNOS",
    metadata: { reference: options.externalReference },
    payer: {
      name: options.payer?.name ?? "",
      email: options.payer?.email ?? "",
    },
  };
  if (options.notificationUrl) body.notification_url = options.notificationUrl;

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": options.externalReference,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Mercado Pago rechazó la preferencia:", res.status, detail);
    throw new Error("No se pudo crear la preferencia de pago");
  }

  const data = (await res.json()) as { id: string; init_point: string };
  return { id: data.id, initPoint: data.init_point };
}

export async function getPayment(paymentId: string): Promise<{
  status: string;
  externalReference?: string;
} | null> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || !paymentId) return null;

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    external_reference?: string;
  };
  return { status: data.status ?? "pending", externalReference: data.external_reference };
}

export function mapMpStatus(status?: string | null): string {
  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "in_process":
    case "in_mediation":
    case "pending":
      return "pending";
    default:
      return "pending";
  }
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Aprobado";
    case "pending":
      return "Pendiente";
    case "rejected":
      return "Rechazado";
    case "cancelled":
      return "Cancelado";
    case "paid":
      return "Pagado";
    case "shipped":
      return "Entregado";
    default:
      return status;
  }
}

export { formatPrice };
