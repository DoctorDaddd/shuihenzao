import { handle } from "../../../../lib/server";
export const dynamic = "force-dynamic";
async function route(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  // Bound the entire request, including chunked uploads and multipart fields.
  // Consume its network stream before returning an early authorization error.
  if (request.body) {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 11 * 1024 * 1024) {
        await reader.cancel();
        return Response.json(
          { error: "图片请控制在 10 MB 以内。" },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: bytes,
    });
  }
  return handle(request, (await context.params).path);
}
export { route as GET, route as POST, route as DELETE };
