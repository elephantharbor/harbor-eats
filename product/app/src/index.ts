export interface Env {
  DB?: D1Database;
  ENVIRONMENT?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "harbor-eats-api",
        environment: env.ENVIRONMENT ?? "unknown",
        d1: Boolean(env.DB),
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        {
          ok: false,
          error: "not_implemented",
          hint: "Wire D1 (Account·D1·Edit) then implement households/plans/ratings.",
        },
        { status: 501 }
      );
    }

    return new Response("Harbor Eats API worker — use /api/health", { status: 404 });
  },
};
