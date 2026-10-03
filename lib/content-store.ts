import "server-only";
import {initialContent,type SiteContent} from "./catalog";
import {contentSchema} from "./content-validation";
import {contentClient} from "./supabase-server";
import {isLocalDev,supabaseSettings} from "./server-config";
export {isLocalDev} from "./server-config";
export {adminIdentity} from "./admin-auth";
export {publicCatalog} from "./catalog";
export type ContentState={draft:SiteContent;published:SiteContent;revision:number;publishedRevision:number;updatedAt:string|null};
const initialState=():ContentState=>({draft:initialContent,published:initialContent,revision:0,publishedRevision:0,updatedAt:null});
const table="yojeumpick_content";
export async function readContent():Promise<ContentState>{
 const settings=supabaseSettings();
 if(!settings.anyConfigured){
  if(!isLocalDev)return initialState();
  const state=(await import("./local-content")).readLocalContent(initialContent);
  return {...state,draft:contentSchema.parse(state.draft),published:contentSchema.parse(state.published)};
 }
 if(!settings.storageReady)throw new Error("Supabase storage settings are incomplete.");
 const {data,error}=await contentClient().from(table).select("draft,published,revision,published_revision,updated_at").eq("id","main").maybeSingle();
 if(error)throw new Error("Content storage read failed.");
 if(!data)return initialState();
 return {draft:contentSchema.parse(data.draft),published:contentSchema.parse(data.published),revision:data.revision,publishedRevision:data.published_revision,updatedAt:data.updated_at};
}
async function persist(next:ContentState,expectedRevision:number){
 if(!supabaseSettings().anyConfigured&&isLocalDev)return (await import("./local-content")).writeLocalContent(initialContent,next,expectedRevision);
 const client=contentClient();
 const {error:insertError}=await client.from(table).upsert({id:"main",draft:initialContent,published:initialContent,revision:0,published_revision:0},{onConflict:"id",ignoreDuplicates:true});
 if(insertError)throw new Error("Content storage initialization failed.");
 const {data,error}=await client.from(table).update({draft:next.draft,published:next.published,revision:next.revision,published_revision:next.publishedRevision,updated_at:next.updatedAt}).eq("id","main").eq("revision",expectedRevision).select("id");
 if(error)throw new Error("Content storage write failed.");
 return data.length===1;
}
export async function saveDraft(draft:SiteContent,revision:number){
 const state=await readContent();if(state.revision!==revision)return false;
 return persist({...state,draft,revision:revision+1,updatedAt:new Date().toISOString()},revision);
}
export async function publishDraft(revision:number){
 const state=await readContent();if(state.revision!==revision)return "conflict";
 if(!state.draft.products.some(p=>p.active))return "empty";
 return await persist({...state,published:state.draft,publishedRevision:revision,revision:revision+1,updatedAt:new Date().toISOString()},revision)?"published":"conflict";
}
