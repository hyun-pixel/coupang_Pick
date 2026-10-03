import {DatabaseSync} from "node:sqlite";
import {mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
import type {SiteContent} from "./catalog";
import type {ContentState} from "./content-store";
function open(seed:SiteContent){
 if(process.env.NODE_ENV!=="development"||process.env.VERCEL)throw new Error("Local storage is development-only.");
 const path=resolve(process.env.LOCAL_CONTENT_PATH??".local/content.sqlite");mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path);
 db.exec("PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS site_content (id TEXT PRIMARY KEY,draft TEXT NOT NULL,published TEXT NOT NULL,revision INTEGER NOT NULL,published_revision INTEGER NOT NULL,updated_at TEXT)");
 const json=JSON.stringify(seed);db.prepare("INSERT OR IGNORE INTO site_content VALUES ('main',?,?,0,0,NULL)").run(json,json);
 return db;
}
export function readLocalContent(seed:SiteContent):ContentState{
 const db=open(seed);try{const row=db.prepare("SELECT * FROM site_content WHERE id='main'").get()!;return {draft:JSON.parse(String(row.draft)),published:JSON.parse(String(row.published)),revision:Number(row.revision),publishedRevision:Number(row.published_revision),updatedAt:row.updated_at===null?null:String(row.updated_at)};}finally{db.close();}
}
export function writeLocalContent(seed:SiteContent,next:ContentState,expectedRevision:number){
 const db=open(seed);try{return db.prepare("UPDATE site_content SET draft=?,published=?,revision=?,published_revision=?,updated_at=? WHERE id='main' AND revision=?").run(JSON.stringify(next.draft),JSON.stringify(next.published),next.revision,next.publishedRevision,next.updatedAt,expectedRevision).changes===1;}finally{db.close();}
}
