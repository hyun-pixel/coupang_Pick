import {z} from "zod";
import {isCoupangUrl,isAffiliateUrl} from "./coupang-links.mjs";
export {isCoupangUrl} from "./coupang-links.mjs";
export function isImageUrl(value:string){try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password;}catch{return false;}}
export function canAdmin(userId:string|undefined,ownerId:string|undefined,localDev:boolean){return !!userId&&(!!ownerId?ownerId===userId:localDev&&userId==="local_seedy");}
const bounded=(n:number)=>z.string().trim().min(1).max(n);
const dateString=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
export const evidenceSchema=z.object({kind:z.enum(["social","coupang","brand"]),sourceName:bounded(60),url:bounded(2000).refine(isImageUrl,"출처는 HTTPS 주소로 입력해 주세요."),publishedAt:dateString,checkedAt:dateString,claim:bounded(350),scope:z.enum(["product","category"])}).strict().refine(e=>e.publishedAt<=e.checkedAt,"출처 발행일이 확인일보다 늦을 수 없어요.");
export const productSchema=z.object({
 id:z.string().regex(/^[a-z0-9][a-z0-9-]{0,69}$/),brand:bounded(50),name:bounded(100),
 category:z.enum(["food","diet","living","kitchen","beauty","digital"]),unit:bounded(100),description:bounded(400),
 image:z.string().trim().max(2000).refine(v=>v===""||isImageUrl(v),"HTTPS 이미지 주소를 확인해 주세요."),
 url:bounded(2000).refine(isCoupangUrl,"쿠팡 상품 주소 또는 파트너스 단축 링크를 입력해 주세요."),
 tags:z.array(z.enum(["간편한 한 끼","집의 재발견","나를 위한 시간"])).min(1).max(3),
 addedAt:dateString,
 active:z.boolean(),imageRights:z.enum(["pending","cleared"]),hook:z.string().trim().max(70).optional(),editorialNote:z.string().trim().max(300).optional(),evidence:z.array(evidenceSchema).max(5).optional()
}).strict().superRefine((v,ctx)=>{if(v.imageRights==="cleared"&&!v.image)ctx.addIssue({code:"custom",message:"사용권 확인을 마친 사진의 주소를 입력하거나 확인 상태를 해제해 주세요.",path:["image"]});});
export const contentSchema=z.object({heroTitle:bounded(40),heroDescription:bounded(130),themeTitle:bounded(45),affiliateActive:z.boolean(),products:z.array(productSchema).min(1).max(200)}).strict().superRefine((v,ctx)=>{
 if(new Set(v.products.map(p=>p.id)).size!==v.products.length)ctx.addIssue({code:"custom",message:"상품 식별자가 중복됩니다.",path:["products"]});
 if(!v.affiliateActive&&v.products.some(p=>p.active&&isAffiliateUrl(p.url)))ctx.addIssue({code:"custom",message:"파트너스 링크를 사용하려면 제휴 안내를 켜 주세요.",path:["affiliateActive"]});
});
