import type { Tool } from "../data/tools";

export type LaunchUrlResult =
  { ok: true; url: string } | { ok: false; error: string };

export type PublishedTool = {
  url: string;
  name: string;
  description: string;
  category: string;
  status: "published";
  featured: boolean;
  submittedAt: number;
  publishedAt: number;
};

export type LaunchResult = PublishedTool & {
  id: string;
};

const privateHostMessage =
  "Use a public website URL, not a local or private address.";

function isPrivateLookingHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".home.arpa") ||
    !host.includes(".")
  ) {
    return true;
  }

  if (host === "::1" || host === "0.0.0.0" || host === "::") return true;

  const ipv4 = host.match(/^(?:\d{1,3}\.){3}\d{1,3}$/);
  if (!ipv4) return false;

  const octets = host.split(".").map(Number);
  if (octets.some((octet) => octet > 255)) return true;
  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

export function validateLaunchUrl(value: string): LaunchUrlResult {
  const input = value.trim();
  if (!input) {
    return { ok: false, error: "Add the HTTPS address for your tool." };
  }

  if (input.length > 2048) {
    return { ok: false, error: "That URL is too long." };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: "Enter a complete website URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Use a direct HTTPS URL." };
  }

  if (url.username || url.password) {
    return {
      ok: false,
      error: "URLs with usernames or passwords are not allowed.",
    };
  }

  if (!url.hostname || isPrivateLookingHost(url.hostname)) {
    return { ok: false, error: privateHostMessage };
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  return { ok: true, url: url.toString() };
}

function toolKey(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "launched-tool";
}

export function publishedToolToDirectoryTool(
  publishedTool: PublishedTool,
): Tool {
  const hostname = new URL(publishedTool.url).hostname.replace(/^www\./, "");

  return {
    slug: `${slugify(publishedTool.name)}-${slugify(hostname)}`,
    name: publishedTool.name,
    url: publishedTool.url,
    description: publishedTool.description,
    category: "New tools",
    status: "listed",
    featured: publishedTool.featured,
  };
}

export function mergeTools(
  staticTools: readonly Tool[],
  publishedTools: readonly PublishedTool[],
): Tool[] {
  const merged: Tool[] = [];
  const seen = new Set<string>();

  for (const tool of publishedTools.map(publishedToolToDirectoryTool)) {
    const url = tool.status === "listed" ? tool.url : undefined;
    const key = url ? toolKey(url) : tool.slug;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(tool);
  }

  for (const tool of staticTools) {
    const url = tool.status === "listed" ? tool.url : undefined;
    const key = url ? toolKey(url) : tool.slug;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(tool);
  }

  return merged;
}
