import type {Product, TrendEvidence} from "./catalog";
export type Signal = "all"|"social"|"coupang"|"brand"|"editor"|"new";
export const signals:{id:Signal;label:string}[]=[
 {id:"all",label:"전체 발견"},{id:"social",label:"SNS에서 포착"},{id:"coupang",label:"쿠팡에서 주목"},{id:"brand",label:"브랜드 소식"},{id:"new",label:"새로 담은 픽"}
];
export function evidenceFor(p:Product):TrendEvidence[]{return p.evidence??[];}
export function sourceLabel(p:Product,reference?:string){
 const evidence=evidenceFor(p)[0],kind=evidence?.kind;
 if(evidence&&reference&&!withinDays(evidence.publishedAt,90,reference))return kind==="social"?"지난 SNS 픽":kind==="brand"?"브랜드 기록":"쿠팡 기록";
 return kind==="social"?"SNS 포착":kind==="coupang"?"쿠팡 소식":kind==="brand"?"브랜드 소식":"에디터 발견";
}
export function shortDate(value:string){return value.slice(5,10).replace("-",".");}
export function withinDays(date:string,days:number,reference:string){
 const value=Date.parse(date+"T00:00:00Z"),now=Date.parse(reference.slice(0,10)+"T00:00:00Z");
 return Number.isFinite(value)&&Number.isFinite(now)&&value<=now&&value>=now-(days-1)*86400000;
}
export function filterDiscoveries(products:Product[],query:string,category:string,theme:string,signal:Signal,period:string,reference:string){
 const terms=query.trim().toLocaleLowerCase("ko").split(/\s+/).filter(Boolean);
 let result=products.filter(p=>{
  if(!p.active||category!=="all"&&p.category!==category||theme!=="전체"&&!p.tags.includes(theme))return false;
  const evidence=evidenceFor(p);
  const relevant=signal==="all"||signal==="new"?evidence:evidence.filter(e=>e.kind===signal);
  if(!["all","new","editor"].includes(signal)&&!relevant.length)return false;
  if(signal==="editor"&&evidence.length)return false;
  if(period!=="all"){
   const dates=signal==="new"?[p.addedAt]:relevant.length?relevant.map(e=>e.publishedAt):[p.addedAt];
   if(!dates.some(d=>withinDays(d,Number(period),reference)))return false;
  }
  const text=[p.name,p.brand,p.description,p.hook,...p.tags,...evidence.map(e=>e.claim)].join(" ").toLocaleLowerCase("ko");
  return terms.every(t=>text.includes(t));
 });
 if(signal==="new")result=[...result].sort((a,b)=>b.addedAt.localeCompare(a.addedAt));
 return result;
}
export function latestCheck(products:Product[]){
 return products.flatMap(p=>[p.addedAt,...evidenceFor(p).map(e=>e.checkedAt)]).sort().at(-1)??"";
}
