import { createApiApp } from "@/server/api/app";

const app = createApiApp();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = (request: Request) => app.fetch(request);

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
