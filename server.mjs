import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const relative = pathname === "/" ? "index.html" : pathname.slice(1);
      const extension = path.extname(relative);
      const file = path.resolve(root, relative);
      if (
        !file.startsWith(root + path.sep) ||
        relative.split("/").some((segment) => segment.startsWith(".")) ||
        !types[extension]
      )
        throw new Error("Not found");
      const data = await readFile(file);
      response.setHeader("Content-Type", types[extension]);
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(await readFile(path.join(root, "404.html")));
    }
  })
  .listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
