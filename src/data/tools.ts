export type ToolStatus = "listed" | "placeholder";

export type ToolCategory =
  "Discovery" | "Analytics" | "Creator utilities" | "Automation" | "New tools";

type ToolBase = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  featured?: boolean;
};

export type ListedTool = ToolBase & {
  status: "listed";
  url: string;
};

export type PlaceholderTool = ToolBase & {
  status: "placeholder";
};

export type Tool = ListedTool | PlaceholderTool;

export const tools = [
  {
    slug: "skool-finder",
    name: "Skool Finder",
    url: "https://skool-finder.com/en/",
    description:
      "Search Skool communities by topic and use filters to find a better fit.",
    category: "Discovery",
    status: "listed",
    featured: true,
  },
  {
    slug: "skooli",
    name: "skoo.li",
    url: "https://www.skoo.li/",
    description:
      "Browse a discovery index with views for trending, new, and growing communities.",
    category: "Discovery",
    status: "listed",
    featured: true,
  },
  {
    slug: "skoolgrades",
    name: "Skoolgrades",
    url: "https://www.skoolgrades.com/",
    description:
      "Explore analytics and community intelligence for Skool communities.",
    category: "Analytics",
    status: "listed",
    featured: true,
  },
  {
    slug: "skool-extensions",
    name: "Skool Extensions",
    url: "https://chromewebstore.google.com/detail/skool-extensions/jinaapgibcgkfaffmpkhdikncmfhpfne",
    description:
      "A Chrome toolkit covering stats, CRM, bookmarks, calendar, translation, and notifications.",
    category: "Creator utilities",
    status: "listed",
  },
  {
    slug: "skooly",
    name: "Skooly",
    url: "https://chromewebstore.google.com/detail/skooly-tools-for-skool/njllaabmdlbgcgfibgkifnboijlpfban",
    description:
      "Organize links and bookmarks, scan members, and review course analytics in Chrome.",
    category: "Creator utilities",
    status: "listed",
  },
  {
    slug: "stickyhive",
    name: "StickyHive",
    url: "https://stickyhive.ai/skool/chrome-extension/",
    description:
      "Plan posts, build onboarding and DM sequences, and watch spam or churn signals.",
    category: "Automation",
    status: "listed",
  },
  {
    slug: "skoolcue",
    name: "SkoolCue",
    url: "https://skoolcue.com/",
    description:
      "Surface welcomes, unanswered threads, and follow-ups so members feel seen and keep moving.",
    category: "Automation",
    status: "listed",
  },
  {
    slug: "tools4skool",
    name: "Tools4Skool",
    url: "https://tools4skool.com/",
    description:
      "Automation and CRM tools with inbox management, exports, risk scores, and Claude/MCP connections.",
    category: "Automation",
    status: "listed",
  },
  {
    slug: "skool-zapier",
    name: "Skool + Zapier",
    url: "https://zapier.com/apps/skool/integrations",
    description:
      "Connect Skool membership triggers and actions to the other apps in a workflow.",
    category: "Automation",
    status: "listed",
  },
  {
    slug: "skool-bookmarks",
    name: "Skool Bookmarks",
    url: "https://chromewebstore.google.com/detail/skool-bookmarks/khapljdjjbnmgpjemihhocghbcfakcmf",
    description: "Save and organize useful Skool posts in a Chrome extension.",
    category: "Creator utilities",
    status: "listed",
  },
  {
    slug: "skool-focus",
    name: "Skool Focus",
    url: "https://chromewebstore.google.com/detail/skool-focus/nchfffdkbhafombnfcpladflclakmdmo",
    description:
      "Hide distracting interface elements when you want a more classroom-focused view.",
    category: "Creator utilities",
    status: "listed",
  },
] satisfies Tool[];

export const categories = [
  "All tools",
  ...Array.from(new Set(tools.map((tool) => tool.category))),
  "New tools",
] as const;
