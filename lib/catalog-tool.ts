import {flushSync} from "react-dom";
import {categories,themes,type Product} from "./catalog";
import {filterDiscoveries} from "./trends";
type FilterInput={query:string;category:string;theme:string};
type ModelContext={registerTool:(tool:{name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
export function registerCatalogTool(products:Product[],apply:(value:FilterInput)=>void){
 const context=(document as Document & {modelContext?:ModelContext}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 try{void Promise.resolve(context.registerTool({
 name:"filter_product_discoveries",title:"요즘픽 상품 필터",
 description:"검색어, 카테고리, 취향으로 현재 상품 목록을 바꿉니다. 외부 사이트 이동이나 구매는 실행하지 않습니다.",
 inputSchema:{type:"object",properties:{query:{type:"string",maxLength:100},category:{type:"string",enum:["all",...categories.map(c=>c.id)]},theme:{type:"string",enum:themes}},required:["query","category","theme"],additionalProperties:false},
 annotations:{readOnlyHint:false,untrustedContentHint:true},
 execute(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("Invalid filter.");
 const v=input as Record<string,unknown>;
 if(Object.keys(v).some(k=>!["query","category","theme"].includes(k))||typeof v.query!=="string"||v.query.length>100||typeof v.category!=="string"||!["all",...categories.map(c=>c.id)].includes(v.category)||typeof v.theme!=="string"||!themes.includes(v.theme))throw new Error("Invalid filter.");
 const value=v as FilterInput;flushSync(()=>apply(value));
 const matches=filterDiscoveries(products,value.query,value.category,value.theme,"all","all",new Date().toISOString().slice(0,10));
 return {count:matches.length,products:matches.map(p=>({id:p.id,name:p.name}))};
 }
 },{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability; regular UI remains available. */}
 return ()=>lifecycle.abort();
}
