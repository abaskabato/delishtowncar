import { NextResponse, type NextRequest } from "next/server";

// Password gate for the whole site while it isn't launched. When SITE_PASSWORD is
// set, every page asks for it with the browser's sign-in prompt (any username).
// Remove SITE_PASSWORD in Vercel to open the site to everyone.
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (sameText(given, password)) return NextResponse.next();
  }

  return new NextResponse("This site isn't open yet.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Delish Town Car (preview)", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

// Compares in constant time so the password can't be guessed from response timing.
function sameText(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = {
  // Everything except Next's own build files, which can't reveal page content.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
