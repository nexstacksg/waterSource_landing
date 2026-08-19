# WaterSource Next.js Site

This folder contains the production TypeScript Next.js WaterSource site.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Shop integration

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_API_BASE_URL=https://evergreen-api.nexstack.sg
NEXT_PUBLIC_SITE_URL=https://watersource-website.nexstack.sg
HITPAY_API_BASE_URL=https://api.sandbox.hit-pay.com/v1
HITPAY_API_KEY=<sandbox-business-api-key>
HITPAY_WEBHOOK_SALT=<sandbox-webhook-salt>
HITPAY_PAYMENT_METHODS=paynow_online,card
```

`/shop` loads live products from the Evergreen API. Checkout creates a sent,
itemized quotation and redirects the buyer to HitPay. It does not create a CRM
lead.

In the HitPay Dashboard, register
`https://<your-domain>/api/hitpay/webhook` for the
`payment_request.completed` event. The webhook validates `Hitpay-Signature`
against the configured salt before creating or reusing the Evergreen customer
directly, creating the invoice, recording payment, and confirming the
sales-history document. The payment-result page also verifies the payment
server-to-server as a fallback if webhook delivery is delayed. The quotation is
accepted only after HitPay confirms payment; browser query parameters alone
never mark an order as paid.
In development, HitPay returns local checkouts to the request's localhost
origin. Production checkouts always return to `NEXT_PUBLIC_SITE_URL`, even when
the application server receives an internal `https://localhost` URL from a
reverse proxy.

Use sandbox credentials during development. For production, change
`HITPAY_API_BASE_URL` to `https://api.hit-pay.com/v1` and use the matching live
API key and webhook salt.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

The app uses the Next.js App Router. Page sections are typed React components in
`components/`, shared styles are under `app/styles/`, and site images are served
from `public/assets/`.
