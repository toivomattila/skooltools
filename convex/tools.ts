import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const publishedToolValidator = v.object({
  url: v.string(),
  name: v.string(),
  description: v.string(),
  category: v.string(),
  status: v.literal("published"),
  featured: v.boolean(),
  submittedAt: v.number(),
  publishedAt: v.number(),
});

const launchResultValidator = v.object({
  id: v.id("tools"),
  ...publishedToolValidator.fields,
});

type LaunchResult = {
  id: Id<"tools">;
  url: string;
  name: string;
  description: string;
  category: string;
  status: "published";
  featured: boolean;
  submittedAt: number;
  publishedAt: number;
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

function normalizeLaunchUrl(value: string): string {
  if (value.length > 2048) {
    throw new Error("That URL is too long.");
  }

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a complete website URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Use a direct HTTPS URL.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with usernames or passwords are not allowed.");
  }

  if (!url.hostname || isPrivateLookingHost(url.hostname)) {
    throw new Error(privateHostMessage);
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function cleanMetadata(value: string | undefined, limit: number): string {
  return decodeHtmlEntities(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function getAttribute(tag: string, attribute: string): string | undefined {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return match?.[1];
}

function parseMetadata(
  html: string,
  pageUrl: string,
): {
  name: string;
  description: string;
} {
  const title = cleanMetadata(
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1],
    120,
  );
  const metadata = new Map<string, string>();

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = (
      getAttribute(tag, "name") ??
      getAttribute(tag, "property") ??
      ""
    ).toLowerCase();
    const content = cleanMetadata(getAttribute(tag, "content"), 280);
    if (key && content) metadata.set(key, content);
  }

  const name = cleanMetadata(metadata.get("og:title") ?? title, 120);
  const description = cleanMetadata(
    metadata.get("og:description") ?? metadata.get("description"),
    280,
  );

  if (!name && !description) {
    throw new Error(
      "This page does not expose usable title or description metadata.",
    );
  }

  const hostname = new URL(pageUrl).hostname.replace(/^www\./, "");
  return {
    name: name || hostname,
    description: description || `Explore ${hostname}.`,
  };
}

async function readHtmlBody(response: Response): Promise<string> {
  if (!response.body) {
    throw new Error("The page did not return readable HTML.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > 1_000_000) {
        throw new Error("The page is too large to read.");
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  return (
    chunks.map((chunk) => decoder.decode(chunk, { stream: true })).join("") +
    decoder.decode()
  );
}

async function fetchMetadata(url: string): Promise<{
  url: string;
  name: string;
  description: string;
}> {
  let currentUrl = url;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    for (let redirect = 0; redirect <= 3; redirect += 1) {
      const response = await fetch(currentUrl, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "SkoolTools directory preview",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirect === 3) {
          throw new Error("The page redirected too many times.");
        }
        currentUrl = normalizeLaunchUrl(
          new URL(location, currentUrl).toString(),
        );
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `The page responded with status ${response.status}. Check the URL and try again.`,
        );
      }

      const finalUrl = normalizeLaunchUrl(response.url || currentUrl);
      const contentType = response.headers.get("content-type") ?? "";
      if (
        contentType &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        throw new Error("That URL does not point to a public HTML page.");
      }

      return {
        url,
        ...parseMetadata(await readHtmlBody(response), finalUrl),
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The page took too long to respond.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        "We could not reach that page. Check the URL and try again.",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("The page could not be read.");
  } finally {
    clearTimeout(timeoutId);
  }

  throw new Error("The page could not be read.");
}

function publicTool(tool: {
  url: string;
  name: string;
  description: string;
  category: string;
  status: "published";
  featured: boolean;
  submittedAt: number;
  publishedAt: number;
}) {
  return {
    url: tool.url,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    status: tool.status,
    featured: tool.featured,
    submittedAt: tool.submittedAt,
    publishedAt: tool.publishedAt,
  };
}

export const listPublished = query({
  args: {},
  returns: v.array(publishedToolValidator),
  handler: async (ctx) => {
    const records = await ctx.db
      .query("tools")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(12);
    return records.map(publicTool);
  },
});

export const getByUrl = internalQuery({
  args: { url: v.string() },
  returns: v.union(publishedToolValidator, v.null()),
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("tools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    return record ? publicTool(record) : null;
  },
});

export const createPublished = internalMutation({
  args: {
    url: v.string(),
    name: v.string(),
    description: v.string(),
    submittedAt: v.number(),
    publishedAt: v.number(),
  },
  returns: launchResultValidator,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (existing) {
      throw new Error("That URL is already in the directory.");
    }

    const tool = {
      url: args.url,
      name: args.name,
      description: args.description,
      category: "New tools",
      status: "published" as const,
      featured: true,
      submittedAt: args.submittedAt,
      publishedAt: args.publishedAt,
    };
    const id = await ctx.db.insert("tools", tool);
    return { id, ...tool };
  },
});

export const launch = action({
  args: { url: v.string() },
  returns: launchResultValidator,
  handler: async (ctx, args): Promise<LaunchResult> => {
    const normalizedUrl = normalizeLaunchUrl(args.url);
    const existing = await ctx.runQuery(internal.tools.getByUrl, {
      url: normalizedUrl,
    });
    if (existing) {
      throw new Error("That URL is already in the directory.");
    }

    const metadata = await fetchMetadata(normalizedUrl);
    const now = Date.now();
    return await ctx.runMutation(internal.tools.createPublished, {
      url: metadata.url,
      name: metadata.name,
      description: metadata.description,
      submittedAt: now,
      publishedAt: now,
    });
  },
});
