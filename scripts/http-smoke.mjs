import assert from "node:assert/strict";
const base = "http://localhost:3100";
const jar = new Map();
async function request(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set(
    "Cookie",
    Array.from(jar)
      .map(([key, value]) => `${key}=${value}`)
      .join("; "),
  );
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  });
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    jar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return response;
}
const listingResponse = await request("/api/listings");
assert.equal(listingResponse.status, 200);
const listings = await listingResponse.json();
assert.equal(listings.total, 6);
const id = listings.listings[0].id;
assert.equal((await request("/listing")).status, 200);
const stayPage = await request(`/listing/${id}`);
assert.equal(stayPage.status, 200);
const stayHTML = await stayPage.text();
assert.ok(stayHTML.includes("lucide-house"));
assert.ok(!stayHTML.includes("lucide-sparkles"));
const loginPage = await request("/login");
assert.equal(loginPage.status, 200);
const loginHTML = await loginPage.text();
assert.match(loginHTML, /<html[^>]*data-scroll-behavior="smooth"/);
assert.ok(loginHTML.includes("Choose color theme"));
assert.ok(loginHTML.includes("Your home. A new beginning."));
for (const href of [
  "https://www.linkedin.com/in/bishal-bhandari-a63b8926a",
  "https://bhandari-bishal.com.np/",
  "https://github.com/4Bishal",
]) {
  assert.ok(loginHTML.includes(`href="${href}"`));
}
assert.ok(loginHTML.includes("Designed &amp; built by"));
assert.ok(
  loginHTML.includes("logo-light.png") && loginHTML.includes("logo-dark.png"),
);
assert.match(loginHTML, /rel="icon"[^>]*href="\/branding\/icon-192.png"/);
assert.match(
  loginHTML,
  /rel="apple-touch-icon"[^>]*href="\/branding\/apple-touch-icon.png"/,
);
assert.ok(
  loginHTML.includes(
    'content="http://localhost:3100/branding/social-preview.png"',
  ),
);
assert.ok(
  loginHTML.includes('name="twitter:card" content="summary_large_image"'),
);
const manifestResponse = await request("/manifest.webmanifest");
assert.equal(manifestResponse.status, 200);
const manifest = await manifestResponse.json();
assert.equal(manifest.short_name, "Aawasly");
assert.equal(manifest.start_url, "/listing");
for (const icon of manifest.icons) {
  const response = await request(icon.src);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("content-type").includes("image/png"));
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    icon.sizes,
    `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
  );
}
const legacyManifest = await request("/manifest.json");
assert.equal(legacyManifest.status, 308);
assert.equal(legacyManifest.headers.get("location"), "/manifest.webmanifest");
for (const path of [
  "logo-light.png",
  "logo-dark.png",
  "apple-touch-icon.png",
  "social-preview.png",
]) {
  const response = await request(`/branding/${path}`);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("content-type").includes("image/png"));
}
const themeScriptPosition = loginHTML.indexOf("aawasly:theme");
assert.ok(
  themeScriptPosition > 0 && themeScriptPosition < loginHTML.indexOf("<header"),
  "Theme initialization must precede visible navigation",
);
const protectedPage = await request("/listing/new");
// App Router can emit redirects in the streamed HTML after the 200 headers.
assert.ok([200, 307].includes(protectedPage.status));
assert.ok(
  (
    protectedPage.headers.get("location") ?? (await protectedPage.text())
  ).includes("/login?callbackUrl=/listing/new"),
);
assert.equal(
  (
    await request(`/api/listings/${id}`, {
      method: "DELETE",
      headers: { Origin: base },
    })
  ).status,
  401,
);
const csrf = await (await request("/api/auth/csrf")).json();
assert.ok(csrf.csrfToken);
const signIn = await request("/api/auth/callback/credentials", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: base,
  },
  body: new URLSearchParams({
    csrfToken: csrf.csrfToken,
    username: "preview_host",
    password: "preview-only-password",
    callbackUrl: `${base}/listing`,
    json: "true",
  }),
});
assert.equal(signIn.status, 200);
const session = await (await request("/api/auth/session")).json();
assert.equal(session.user.name, "preview_host");
assert.equal((await request("/listing/new")).status, 200);
const detail = await (await request(`/api/listings/${id}`)).json();
const edit = await request(`/api/listings/${id}`, {
  method: "PATCH",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: `${detail.title} updated`,
    description: detail.description,
    price: 2000,
    location: detail.location,
    country: detail.country,
    category: detail.category,
    amenities: detail.amenities,
    images: detail.images,
  }),
});
assert.equal(edit.status, 200);
const review = await request(`/api/listings/${id}/reviews`, {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({ comment: "A lovely smoke-tested stay", rating: 5 }),
});
assert.equal(review.status, 201);
const created = await review.json();
const remove = await request(`/api/listings/${id}/reviews/${created.id}`, {
  method: "DELETE",
  headers: { Origin: base },
});
assert.equal(remove.status, 204);
const forbidden = await request(`/api/listings/${id}`, {
  method: "DELETE",
  headers: { Origin: "https://evil.example" },
});
assert.equal(forbidden.status, 403);
// Leave the ephemeral listing available for visual QA.
const hostCookies = new Map(jar);
const username = `smoke_${Date.now()}`;
const signupBody = {
  username,
  email: `${username}@example.test`,
  password: "a fresh smoke test password",
};
const signup = await request("/api/auth/signup", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify(signupBody),
});
assert.equal(signup.status, 201);
const duplicate = await request("/api/auth/signup", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify(signupBody),
});
assert.equal(duplicate.status, 409);
jar.clear();
const freshCSRF = await (await request("/api/auth/csrf")).json();
const freshLogin = await request("/api/auth/callback/credentials", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: base,
  },
  body: new URLSearchParams({
    csrfToken: freshCSRF.csrfToken,
    username,
    password: signupBody.password,
    callbackUrl: `${base}/listing`,
    json: "true",
  }),
});
assert.equal(freshLogin.status, 200);
assert.equal(
  (await (await request("/api/auth/session")).json()).user.name,
  username,
);
assert.equal(
  (
    await request(`/api/listings/${id}`, {
      method: "DELETE",
      headers: { Origin: base },
    })
  ).status,
  403,
);
const freshReview = await request(`/api/listings/${id}/reviews`, {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    comment: "The new account review flow works",
    rating: 4,
  }),
});
assert.equal(freshReview.status, 201);
const freshReviewData = await freshReview.json();
const guestCookies = new Map(jar);
jar.clear();
for (const [key, value] of hostCookies) jar.set(key, value);
assert.equal(
  (
    await request(`/api/listings/${id}/reviews/${freshReviewData.id}`, {
      method: "DELETE",
      headers: { Origin: base },
    })
  ).status,
  403,
);
jar.clear();
for (const [key, value] of guestCookies) jar.set(key, value);
assert.equal(
  (
    await request(`/api/listings/${id}/reviews/${freshReviewData.id}`, {
      method: "DELETE",
      headers: { Origin: base },
    })
  ).status,
  204,
);
console.log(
  "HTTP smoke checks passed: rendering, protected routes, legacy login, session cookies, listing edit, reviews, and origin enforcement.",
);
