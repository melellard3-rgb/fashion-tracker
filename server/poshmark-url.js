// URL resolution for Poshmark listing imports.
//
// Kept in its own module with no side effects so it can be unit tested. Getting
// a share link to the real listing has broken twice now, both times on an
// assumption about how the redirect behaves:
//
//   1. Only poshmark.com hosts were accepted, so posh.mk was rejected outright.
//   2. posh.mk was assumed to redirect all the way to the listing. It does not:
//      it 307s to Branch (bnc.lt), which answers 200 with a "Launching
//      Poshmark…" interstitial and carries the real destination in its markup.

export const BROWSER_UA = "Mozilla/5.0 (compatible; BQI listing importer)";

// Explicit allowlists rather than patterns. Two earlier regex attempts both let
// attacker-registrable domains through — `poshmark\.[a-z.]+$` matched
// "poshmark.com.evil.test", and allowing a two-label suffix still matched
// "poshmark.evil.test". Since the server fetches whatever this approves and
// returns its content, exact domains are the only safe form. Extend the list if
// Poshmark adds a market.
const POSHMARK_DOMAINS = ["poshmark.com", "poshmark.ca", "poshmark.com.au", "poshmark.in"];

// posh.mk is Poshmark's own shortener; bnc.lt and app.link are the Branch
// domains it hands off to.
const SHARE_LINK_DOMAINS = ["posh.mk", "bnc.lt", "app.link"];

const normalizeHost = (host) => String(host || "").toLowerCase().replace(/\.$/, "");
const matchesDomain = (host, domains) => {
  const normalized = normalizeHost(host);
  return domains.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
};

export const isPoshmarkHost = (host) => matchesDomain(host, POSHMARK_DOMAINS);
export const isShareLinkHost = (host) => matchesDomain(host, SHARE_LINK_DOMAINS);

export const isListingUrl = (url) => isPoshmarkHost(url.hostname) && /\/listing\//i.test(url.pathname);

// Pulls the real listing URL out of a Branch interstitial. The page carries it
// in an "open this link in your browser" anchor and in a window.top.location
// assignment; both are plain, unescaped URLs. The character class stops before
// "?", which drops Branch's utm tracking parameters.
export function findListingUrlInHtml(html) {
  const match = String(html || "").match(/https?:\/\/(?:[a-z0-9-]+\.)*poshmark\.[a-z.]+\/listing\/[A-Za-z0-9_-]+/i);
  if (!match) return null;
  try {
    const url = new URL(match[0]);
    return isListingUrl(url) ? url : null;
  } catch {
    return null;
  }
}

// Follows a share link to the actual listing page and returns its HTML.
// At most one extra hop: short link -> interstitial -> listing.
// `fetchImpl` is injectable so tests can run without network access.
export async function resolveListing(startUrl, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(startUrl, { redirect: "follow", headers: { "User-Agent": BROWSER_UA } });
  } catch (error) {
    return { error: "Could not reach that link.", status: 502, detail: error.message };
  }
  if (!response.ok) return { error: "Poshmark did not return this listing.", status: 502 };

  let finalUrl = startUrl;
  try {
    finalUrl = new URL(response.url || String(startUrl));
  } catch { /* keep the original */ }

  const html = await response.text();

  // Landed straight on the listing.
  if (isListingUrl(finalUrl)) return { url: finalUrl, html };

  // Otherwise this should be the Branch interstitial — dig the destination out
  // of its markup rather than trusting the URL we ended up at.
  const embedded = findListingUrlInHtml(html);
  if (!embedded) {
    // A dead or mistyped share link just lands on the Poshmark homepage, which
    // would otherwise be scraped and returned as though it were a listing.
    return { error: "That link didn't resolve to a Poshmark listing — check the link and try again.", status: 400 };
  }

  let listingResponse;
  try {
    listingResponse = await fetchImpl(embedded, { redirect: "follow", headers: { "User-Agent": BROWSER_UA } });
  } catch (error) {
    return { error: "Could not reach that listing.", status: 502, detail: error.message };
  }
  if (!listingResponse.ok) return { error: "Poshmark did not return this listing.", status: 502 };
  return { url: embedded, html: await listingResponse.text() };
}
