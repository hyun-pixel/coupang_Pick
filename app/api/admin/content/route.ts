import {adminIdentity,contentDb,ensureContentRow,readContent} from "@/lib/content-store";
import {contentSchema} from "@/lib/content-validation";
import {z} from "zod";
import {readLimitedBody} from "@/lib/request-body";
export const dynamic="force-dynamic";
const envelope=z.discriminatedUnion("action",[
 z.object({action:z.literal("save"),revision:z.number().int().nonnegative(),content:contentSchema}).strict(),
 z.object({action:z.literal("publish"),revision:z.number().int().nonnegative()}).strict()
]);
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request){
 const {allowed}=await adminIdentity();
 let raw:string|null;try{raw=await readLimitedBody(request);}catch{return json({error:"요청 내용을 읽지 못했어요."},400);}
 if(!allowed)return json({error:"운영자 로그인 후 이용할 수 있어요."},403);
 if(request.headers.get("origin")!==new URL(request.url).origin)return json({error:"요청 출처가 올바르지 않아요."},403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return json({error:"요청 형식을 확인해 주세요."},415);
 if(raw===null)return json({error:"저장할 내용이 너무 커요."},413);
 let input:z.infer<typeof envelope>;
 try{input=envelope.parse(JSON.parse(raw));}catch(e){return json({error:e instanceof z.ZodError?e.issues[0]?.message:"입력 내용을 확인해 주세요."},400);}
 try{
 await ensureContentRow();const now=new Date().toISOString();
 if(input.action==="save"){
 const result=await contentDb().prepare("UPDATE site_content SET draft = ?, revision = revision + 1, updated_at = ? WHERE id = 'main' AND revision = ?").bind(JSON.stringify(input.content),now,input.revision).run();
 if(result.meta.changes!==1)return json({error:"다른 창에서 내용이 변경됐어요. 현재 내용을 보관한 뒤 새로고침해 주세요."},409);
 }else{
 const state=await readContent();
 if(!state.draft.products.some(p=>p.active))return json({error:"표시할 상품을 한 개 이상 선택해 주세요."},400);

 const result=await contentDb().prepare("UPDATE site_content SET published = draft, published_revision = revision, revision = revision + 1, updated_at = ? WHERE id = 'main' AND revision = ?").bind(now,input.revision).run();
 if(result.meta.changes!==1)return json({error:"저장된 초안이 변경됐어요. 새로고침 후 다시 확인해 주세요."},409);
 }
 return json(await readContent());
 }catch{return json({error:"저장소에 연결하지 못했어요. 변경 내용은 이 화면에 남아 있으니 잠시 후 다시 저장해 주세요."},503);}
}
