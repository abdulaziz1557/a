import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  receipts: defineTable({
    customerName: v.string(),
    po: v.string(),
    date: v.string(),
    imageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_customer", ["customerName"])
    .index("by_po", ["po"])
    .index("by_date", ["date"])
    .index("by_created_at", ["createdAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
