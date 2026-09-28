export type PaymentEmailInput = {
  invoiceNumber: string;
  paidAt: string;
  total: number;
  customer: { name: string; email: string; phone?: string; address?: string };
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  customerOrderUrl?: string;
  adminInvoiceUrl?: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

function safeUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol)
      ? escapeHtml(url.href)
      : null;
  } catch {
    return null;
  }
}

const money = (value: number) =>
  new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);

/** Pure templates: call from the existing verified-payment email sender. */
export function buildPaymentEmail(
  input: PaymentEmailInput,
  audience: "customer" | "admin",
) {
  const admin = audience === "admin";
  const subject = admin
    ? `Payment received · ${input.invoiceNumber}`
    : `Thank you for your WaterSource order · ${input.invoiceNumber}`;
  const heading = admin ? "New paid order" : "Thank you for your order.";
  const introduction = admin
    ? "Payment is confirmed. Review the order below and arrange delivery or installation."
    : `Hi ${input.customer.name}, your payment is confirmed. We’ll contact you to arrange delivery and installation where applicable.`;
  const date = new Date(input.paidAt);
  const paidDate = Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-SG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Singapore",
      }).format(date) + " (Singapore time)";
  const rawUrl = admin ? input.adminInvoiceUrl : input.customerOrderUrl;
  const url = safeUrl(rawUrl);
  const action = admin ? "View invoice" : "View your order";
  const contact = [
    input.customer.name,
    input.customer.email,
    input.customer.phone,
    input.customer.address,
  ].filter((value): value is string => Boolean(value));
  const text = [
    "WATERSOURCE",
    "",
    heading,
    introduction,
    "",
    `Invoice: ${input.invoiceNumber}`,
    `Paid: ${paidDate}`,
    "Status: Paid",
    "",
    "Order summary",
    ...input.items.map(
      (item) => `${item.name} × ${item.quantity} — ${money(item.lineTotal)}`,
    ),
    "",
    `Total paid: ${money(input.total)}`,
    "",
    admin ? "Customer & delivery details" : "Your details",
    ...contact,
    ...(url ? ["", `${action}: ${rawUrl}`] : []),
    "",
    admin
      ? "WaterSource order notification"
      : "Thank you for choosing WaterSource.",
  ].join("\n");
  const rows = input.items
    .map(
      (item) => `<tr>
    <td style="padding:16px 0;border-bottom:1px solid #e0edf1;color:#183542;font-size:14px;">${escapeHtml(item.name)}</td>
    <td style="padding:16px 10px;border-bottom:1px solid #e0edf1;text-align:center;font-size:14px;">${item.quantity}</td>
    <td style="padding:16px 0;border-bottom:1px solid #e0edf1;text-align:right;white-space:nowrap;font-size:14px;">${escapeHtml(money(item.lineTotal))}</td>
  </tr>`,
    )
    .join("");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#eef6f8;font-family:Arial,Helvetica,sans-serif;color:#183542;">
<div style="display:none;max-height:0;overflow:hidden;">Payment confirmed for ${escapeHtml(input.invoiceNumber)} — ${escapeHtml(money(input.total))}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
<tr><td style="background:#082c3a;padding:28px 24px;color:#fff;">
<p style="margin:0;font-size:22px;letter-spacing:3px;font-weight:bold;">WATERSOURCE</p>
<p style="margin:8px 0 0;font-size:12px;color:#b4e7ec;">Better water. Better everyday.</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<span style="display:inline-block;padding:6px 12px;background:#e6f5ed;color:#226345;border-radius:20px;font-size:12px;font-weight:bold;">PAYMENT CONFIRMED</span>
<h1 style="margin:20px 0 12px;font-size:28px;line-height:1.2;">${heading}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#526975;">${escapeHtml(introduction)}</p>
<table role="presentation" width="100%" style="background:#f1f8fa;border-radius:10px;" cellpadding="14" cellspacing="0"><tr><td>
<p style="margin:0 0 6px;font-size:13px;">Invoice <strong>${escapeHtml(input.invoiceNumber)}</strong></p>
<p style="margin:0;font-size:12px;color:#526975;">Paid ${escapeHtml(paidDate)}</p>
</td></tr></table>
<h2 style="margin:26px 0 8px;font-size:18px;">Order summary</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
<thead><tr><th align="left" style="padding:10px 0;font-size:12px;color:#526975;">PRODUCT</th><th style="padding:10px;font-size:12px;color:#526975;">QTY</th><th align="right" style="padding:10px 0;font-size:12px;color:#526975;">AMOUNT</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><th colspan="2" align="left" style="padding:20px 0;font-size:16px;">Total paid</th><td align="right" style="padding:20px 0;font-size:22px;font-weight:bold;color:#087895;">${escapeHtml(money(input.total))}</td></tr></tfoot>
</table>
<h2 style="margin:20px 0 12px;font-size:18px;">${admin ? "Customer &amp; delivery details" : "Your details"}</h2>
<p style="margin:0;font-size:14px;line-height:1.8;overflow-wrap:anywhere;">${contact.map(escapeHtml).join("<br>")}</p>
${url ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr><td bgcolor="#087895" style="border-radius:8px;"><a href="${url}" style="display:inline-block;padding:15px 22px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">${action}</a></td></tr></table>` : ""}
</td></tr>
<tr><td style="padding:22px 24px;border-top:1px solid #e0edf1;color:#637b85;font-size:12px;line-height:1.6;">${admin ? "WaterSource · Internal order notification" : "Thank you for choosing WaterSource."}</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
