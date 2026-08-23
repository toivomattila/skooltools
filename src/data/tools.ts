export type ToolStatus = "example" | "placeholder";

export type ToolCategory = "Operations" | "Content" | "Member experience";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  note: string;
  featured?: boolean;
};

export const tools = [
  {
    slug: "creator-roster",
    name: "Creator roster",
    description:
      "A simple member follow-up sheet for names, offers, and the next useful conversation.",
    category: "Operations",
    status: "example",
    note: "Example outline",
    featured: true,
  },
  {
    slug: "weekly-prompt-pack",
    name: "Weekly prompt pack",
    description:
      "A handful of prompts to help you plan posts that give members a reason to show up.",
    category: "Content",
    status: "example",
    note: "Example outline",
    featured: true,
  },
  {
    slug: "launch-checklist",
    name: "Launch checklist",
    description:
      "A short, practical checklist for opening a new community without forgetting the small stuff.",
    category: "Operations",
    status: "placeholder",
    note: "Coming later",
    featured: true,
  },
  {
    slug: "welcome-sequence",
    name: "Welcome sequence planner",
    description:
      "Map the first seven days for a new member, from hello to their first small win.",
    category: "Member experience",
    status: "placeholder",
    note: "Coming later",
  },
  {
    slug: "community-health-check",
    name: "Community health check",
    description:
      "A lightweight monthly check-in for spotting quiet rooms, unanswered questions, and repeat wins.",
    category: "Member experience",
    status: "placeholder",
    note: "Coming later",
  },
  {
    slug: "content-repurpose-map",
    name: "Content repurpose map",
    description:
      "Turn one strong lesson into a week of prompts, replies, and follow-up resources.",
    category: "Content",
    status: "placeholder",
    note: "Coming later",
  },
] satisfies Tool[];

export const categories = [
  "All tools",
  ...Array.from(new Set(tools.map((tool) => tool.category))),
] as const;
