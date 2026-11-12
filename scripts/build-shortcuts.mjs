import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PUBLIC_ORIGIN = "https://tic-tac-taf.vercel.app";

const SHORTCUTS = [
  {
    fileName: "Je commence au bureau.shortcut",
    name: "Je commence au bureau",
    path: "/api/arrive",
  },
  {
    fileName: "Je pars du bureau.shortcut",
    name: "Je pars du bureau",
    path: "/api/leave",
  },
];

/**
 * Reads ACCESS_TOKEN from the local env file.
 *
 * @returns Configured access secret
 */
function readAccessToken() {
  const envFile = readFileSync(".env", "utf8");
  const match = envFile.match(/^ACCESS_TOKEN="([^"]+)"/m);

  if (!match) {
    throw new Error("ACCESS_TOKEN is missing from .env");
  }

  return match[1];
}

/**
 * Escapes text placed inside an XML element.
 *
 * @param value Raw text
 * @returns XML-safe text
 */
function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Builds an unsigned shortcut that posts to one punch endpoint and shows the label in Siri.
 *
 * @param name Shortcut title shown in the Shortcuts app
 * @param url Endpoint called by the shortcut
 * @returns XML property list
 */
function buildUnsignedShortcut(name, url) {
  const downloadId = randomUUID().toUpperCase();
  const resultId = randomUUID().toUpperCase();

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WFWorkflowClientRelease</key>
  <string>18.0</string>
  <key>WFWorkflowClientVersion</key>
  <string>3036.0.4.2</string>
  <key>WFWorkflowHasOutputFallback</key>
  <false/>
  <key>WFWorkflowIcon</key>
  <dict>
    <key>WFWorkflowIconGlyphNumber</key>
    <integer>59511</integer>
    <key>WFWorkflowIconStartColor</key>
    <integer>-28672</integer>
  </dict>
  <key>WFWorkflowMinimumClientVersion</key>
  <integer>1113</integer>
  <key>WFWorkflowMinimumClientVersionString</key>
  <string>1113</string>
  <key>WFWorkflowName</key>
  <string>${escapeXml(name)}</string>
  <key>WFWorkflowTypes</key>
  <array>
    <string>NCWidget</string>
    <string>Watch</string>
  </array>
  <key>WFWorkflowActions</key>
  <array>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.downloadurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>UUID</key>
        <string>${downloadId}</string>
        <key>WFHTTPMethod</key>
        <string>POST</string>
        <key>WFURL</key>
        <string>${escapeXml(url)}</string>
      </dict>
    </dict>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.showresult</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>UUID</key>
        <string>${resultId}</string>
        <key>Text</key>
        <dict>
          <key>Value</key>
          <dict>
            <key>attachmentsByRange</key>
            <dict>
              <key>{0, 1}</key>
              <dict>
                <key>OutputName</key>
                <string>Contents of URL</string>
                <key>OutputUUID</key>
                <string>${downloadId}</string>
                <key>Type</key>
                <string>ActionOutput</string>
              </dict>
            </dict>
            <key>string</key>
            <string>\uFFFC</string>
          </dict>
          <key>WFSerializationType</key>
          <string>WFTextTokenString</string>
        </dict>
      </dict>
    </dict>
  </array>
</dict>
</plist>
`;
}

/**
 * Signs every iPhone shortcut and writes them as a TypeScript module.
 */
function buildShortcutModule() {
  const token = readAccessToken();
  const files = {};

  for (const shortcut of SHORTCUTS) {
    const url = `${PUBLIC_ORIGIN}${shortcut.path}?token=${encodeURIComponent(token)}&format=text`;
    const xmlPath = join(tmpdir(), `${shortcut.fileName}.xml`);
    const unsignedPath = join(tmpdir(), `unsigned-${shortcut.fileName}`);
    const signedPath = join(tmpdir(), shortcut.fileName);
    writeFileSync(xmlPath, buildUnsignedShortcut(shortcut.name, url));
    execFileSync("plutil", ["-convert", "binary1", "-o", unsignedPath, xmlPath]);
    execFileSync("shortcuts", [
      "sign",
      "--mode",
      "anyone",
      "--input",
      unsignedPath,
      "--output",
      signedPath,
    ]);
    files[shortcut.fileName] = readFileSync(signedPath).toString("base64");
  }

  const body = Object.entries(files)
    .map(([fileName, contents]) => `  ${JSON.stringify(fileName)}: ${JSON.stringify(contents)},`)
    .join("\n");

  writeFileSync(
    "src/lib/shortcut-files.ts",
    `export const SHORTCUT_FILES: Record<string, string> = {\n${body}\n};\n`,
  );
}

buildShortcutModule();
