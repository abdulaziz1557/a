import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    
    return Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        imageUrl: receipt.imageId ? await ctx.storage.getUrl(receipt.imageId) : null,
      }))
    );
  },
});

export const getAllReceipts = query({
  args: {},
  handler: async (ctx) => {
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    
    return Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        imageUrl: receipt.imageId ? await ctx.storage.getUrl(receipt.imageId) : null,
      }))
    );
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    searchType: v.union(v.literal("customer"), v.literal("po"), v.literal("date")),
  },
  handler: async (ctx, args) => {
    let receipts: any[] = [];
    
    // البحث الجزئي في جميع الاستلامات
    const allReceipts = await ctx.db.query("receipts").collect();
    
    const searchTermLower = args.searchTerm.toLowerCase();
    
    if (args.searchType === "customer") {
      receipts = allReceipts.filter(receipt => 
        receipt.customerName.toLowerCase().includes(searchTermLower)
      );
    } else if (args.searchType === "po") {
      receipts = allReceipts.filter(receipt => 
        receipt.po.toLowerCase().includes(searchTermLower)
      );
    } else if (args.searchType === "date") {
      receipts = allReceipts.filter(receipt => 
        receipt.date.includes(args.searchTerm)
      );
    }
    
    // ترتيب النتائج حسب تاريخ الإنشاء (الأحدث أولاً)
    receipts.sort((a, b) => b.createdAt - a.createdAt);
    
    return Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        imageUrl: receipt.imageId ? await ctx.storage.getUrl(receipt.imageId) : null,
      }))
    );
  },
});

export const getReceiptsByCustomer = query({
  args: { customerName: v.string() },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("customerName"), args.customerName))
      .collect();
    
    return receipts.map(receipt => ({
      customerName: receipt.customerName,
      po: receipt.po,
      date: receipt.date,
      createdAt: receipt.createdAt,
    }));
  },
});

export const getReceiptsByDateRange = query({
  args: { 
    dateFrom: v.string(),
    dateTo: v.string()
  },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.dateFrom),
          q.lte(q.field("date"), args.dateTo)
        )
      )
      .collect();
    
    return receipts.map(receipt => ({
      customerName: receipt.customerName,
      po: receipt.po,
      date: receipt.date,
      createdAt: receipt.createdAt,
    }));
  },
});

export const getAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    const receipts = await ctx.db.query("receipts").collect();
    const customers = [...new Set(receipts.map(receipt => receipt.customerName))];
    return customers.sort();
  },
});

export const getById = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    if (!receipt) return null;
    
    return {
      ...receipt,
      imageUrl: receipt.imageId ? await ctx.storage.getUrl(receipt.imageId) : null,
    };
  },
});

export const create = mutation({
  args: {
    customerName: v.string(),
    po: v.string(),
    date: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("receipts", {
      customerName: args.customerName,
      po: args.po,
      date: args.date,
      imageId: args.imageId,
      createdAt: Date.now(),
    });
  },
});

export const deleteReceipt = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("الاستلام غير موجود");
    }
    
    // حذف الصورة من التخزين إذا كانت موجودة
    if (receipt.imageId) {
      await ctx.storage.delete(receipt.imageId);
    }
    
    // حذف الاستلام من قاعدة البيانات
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
