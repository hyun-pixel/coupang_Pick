import {env} from "cloudflare:workers";
import {initialContent,type SiteContent} from "./catalog";
import {contentSchema,canAdmin} from "./content-validation";
import {getChatGPTUser} from "@/app/chatgpt-auth";
export const isLocalDev=import.meta.env.DEV;
export async function adminIdentity(){const user=await getChatGPTUser();return {user,allowed:canAdmin(user?.userId,env.ADMIN_USER_ID,isLocalDev)};}
export function contentDb(){if(!env.DB)throw new Error("Content database is not configured.");return env.DB;}
export type ContentState={draft:SiteContent;published:SiteContent;revision:number;publishedRevision:number;updatedAt:string|null};
export async function readContent():Promise<ContentState>{
 const row=await contentDb().prepare("SELECT * FROM site_content WHERE id = ?").bind("main").first<{draft:string;published:string;revision:number;published_revision:number;updated_at:string}>();
 if(!row)return {draft:initialContent,published:initialContent,revision:0,publishedRevision:0,updatedAt:null};
 return {draft:contentSchema.parse(JSON.parse(row.draft)),published:contentSchema.parse(JSON.parse(row.published)),revision:row.revision,publishedRevision:row.published_revision,updatedAt:row.updated_at};
}
export async function ensureContentRow(){const seed=JSON.stringify(initialContent);await contentDb().prepare("INSERT OR IGNORE INTO site_content (id,draft,published,revision,published_revision,updated_at) VALUES (?, ?, ?, 0, 0, ?)").bind("main",seed,seed,new Date().toISOString()).run();}


export {publicCatalog} from "./catalog";
