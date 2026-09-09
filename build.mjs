import { mkdir, cp, readdir, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
for (const item of await readdir("."))
  if (item.endsWith(".html") || ["css", "js", "assets"].includes(item))
    await cp(item, `dist/${item}`, { recursive: true });
console.log("Static production build ready in dist");
