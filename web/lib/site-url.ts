const DEFAULT_SITE_URL = "https://watersource-website.nexstack.sg";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]);

function configuredSiteOrigin() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }
}

export function resolveCheckoutSiteUrl(request: Request) {
  const requestUrl = new URL(request.url);

  if (LOCAL_HOSTNAMES.has(requestUrl.hostname)) {
    return requestUrl.origin;
  }

  return configuredSiteOrigin();
}
