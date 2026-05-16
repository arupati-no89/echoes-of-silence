import { NextRequest, NextResponse } from "next/server";

const REALM = "Echoes of Silence";

/**
 * 身内向け Basic 認証。
 * BASIC_AUTH_USER / BASIC_AUTH_PASS が設定されていれば全リクエストを保護する。
 * 未設定なら認証スキップ（ローカル開発用）。
 */
export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) return unauthorized();
  const reqUser = decoded.slice(0, idx);
  const reqPass = decoded.slice(idx + 1);

  if (reqUser !== user || reqPass !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export const config = {
  // _next/static, _next/image, favicon は除外（CSS/JSロード時に毎回認証ダイアログが出るのを防ぐ）
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
