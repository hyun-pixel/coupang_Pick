import {sqliteTable,text,integer} from "drizzle-orm/sqlite-core";
// ponytail: One versioned document is sufficient for the initial <= 200-item catalog.
export const siteContent=sqliteTable("site_content",{
 id:text("id").primaryKey(),draft:text("draft").notNull(),published:text("published").notNull(),
 revision:integer("revision").notNull().default(0),publishedRevision:integer("published_revision").notNull().default(0),updatedAt:text("updated_at").notNull()
});
