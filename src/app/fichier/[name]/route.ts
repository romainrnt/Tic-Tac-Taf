import { hasBrowserAccess } from "@/lib/session";
import { SHORTCUT_FILES } from "@/lib/shortcut-files";

/**
 * Sends one signed shortcut to a browser that already unlocked the tracker.
 *
 * @param _request Incoming request
 * @param context Route params containing the shortcut file name
 * @returns Shortcut file, or an error response
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  if (!(await hasBrowserAccess())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { name } = await context.params;
  const encoded = SHORTCUT_FILES[name];

  if (!encoded) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(encoded, "base64"), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": describeShortcutDownload(name),
      "Cache-Control": "private, no-store",
    },
  });
}

/**
 * Names the download after the Siri phrase so iOS imports that exact title.
 *
 * @param fileName Shortcut file name, including the extension
 * @returns Content-Disposition value
 */
function describeShortcutDownload(fileName: string): string {
  return `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
