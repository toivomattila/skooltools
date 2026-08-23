import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tools: defineTable({
    url: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    status: v.literal("published"),
    featured: v.boolean(),
    submittedAt: v.number(),
    publishedAt: v.number(),
  })
    .index("by_url", ["url"])
    .index("by_status", ["status"]),
});
