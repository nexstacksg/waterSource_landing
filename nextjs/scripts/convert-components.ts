import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(scriptDirectory, "../../components");
const outputDirectory = path.resolve(scriptDirectory, "../components");

function componentName(fileName: string) {
  return fileName
    .replace(/\.html$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toJsx(html: string) {
  return html
    .replace(/\bclass=/g, "className=")
    .replace(/\ballowfullscreen=""/g, "allowFullScreen")
    .replace(/\bopen=""/g, "open")
    .replace(/<br>/g, "<br />")
    .replace(/src="assets\//g, 'src="/assets/')
    .replace(/style="margin-top:22px"/g, 'style={{ marginTop: "22px" }}')
    .replace(
      /style="max-width:980px;margin:22px auto 0"/g,
      'style={{ maxWidth: "980px", margin: "22px auto 0" }}',
    )
    .replace(
      /style="max-width:850px;margin:20px auto 0"/g,
      'style={{ maxWidth: "850px", margin: "20px auto 0" }}',
    )
    .replace(
      /style="max-width:760px;margin:18px auto 0"/g,
      'style={{ maxWidth: "760px", margin: "18px auto 0" }}',
    )
    .replace(
      /style="--hidden-problem-bg:url\('([^']+)'\)"/g,
      'style={{ "--hidden-problem-bg": "url(\'$1\')" } as CSSProperties}',
    );
}

function applyNextNavigation(fileName: string, jsx: string) {
  if (fileName !== "header.html") return jsx;

  return jsx
    .replace(/\s*<small>Functional Water Journey<\/small>/, "")
    .replace('href="#top"', 'href="/"')
    .replace(
      /href="#(who|about|founder|method|bonus|consultation)"/g,
      'href="/#$1"',
    )
    .replace(
      '<a href="/#consultation">Consultation</a>',
      '<a href="/shop">Shop</a>\n    <a href="/#consultation">Consultation</a>',
    )
    .replace(/<a /g, "<Link ")
    .replace(/<\/a>/g, "</Link>");
}

fs.mkdirSync(outputDirectory, { recursive: true });

for (const fileName of fs.readdirSync(sourceDirectory).sort()) {
  if (!fileName.endsWith(".html")) continue;

  const name = componentName(fileName);
  const html = fs
    .readFileSync(path.join(sourceDirectory, fileName), "utf8")
    .trim();
  const jsx = applyNextNavigation(fileName, toJsx(html));
  const imports = [
    jsx.includes("CSSProperties")
      ? 'import type { CSSProperties } from "react";'
      : "",
    fileName === "header.html" ? 'import Link from "next/link";' : "",
  ]
    .filter(Boolean)
    .join("\n");
  const component = `${imports ? `${imports}\n\n` : ""}export default function ${name}() {
  return <>
${jsx}
  </>;
}
`;

  fs.writeFileSync(path.join(outputDirectory, `${name}.tsx`), component);
}

console.log(
  `Converted components from ${sourceDirectory} to ${outputDirectory}`,
);
