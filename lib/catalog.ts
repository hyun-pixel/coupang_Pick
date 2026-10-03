import seedProducts from "../data/products.json" with {type:"json"};
export const categories = [
 {id:"food",label:"음식·간식",short:"먹는 즐거움",color:"#fff0d4"},
 {id:"diet",label:"다이어트·식단",short:"가벼운 한 끼",color:"#e5f1df"},
 {id:"living",label:"생활용품",short:"일상의 쓸모",color:"#e8edff"},
 {id:"kitchen",label:"주방용품",short:"주방의 발견",color:"#f7e8dd"},
 {id:"beauty",label:"뷰티·셀프케어",short:"나를 돌보는 시간",color:"#fbe5eb"},
 {id:"digital",label:"디지털·가전",short:"똑똑한 일상",color:"#e2f0f4"},
] as const;
export type CategoryId = typeof categories[number]["id"];
export type TrendEvidence = {kind:"social"|"coupang"|"brand";sourceName:string;url:string;publishedAt:string;checkedAt:string;claim:string;scope:"product"|"category"};
export type Product = {id:string;brand:string;name:string;category:CategoryId;unit:string;description:string;image:string;url:string;tags:string[];addedAt:string;active:boolean;imageRights:"pending"|"cleared";hook?:string;editorialNote?:string;evidence?:TrendEvidence[]};
export type SiteContent = {heroTitle:string;heroDescription:string;themeTitle:string;products:Product[];affiliateActive:boolean};
export const initialContent:SiteContent = {
 heroTitle:"쿠팡 가기 전,\n요즘 뭐 뜨는지.",heroDescription:"어디서, 왜 주목받았을까?\n알고 보면 더 재밌는 쇼핑의 발견.",
 themeTitle:"한 끼도,\n새롭게 먹고 싶어.",affiliateActive:true,products:seedProducts as Product[]
};
export const themes = ["전체","간편한 한 끼","집의 재발견","나를 위한 시간"];
export function filterProducts(products:Product[],query:string,category:string,theme:string,sort:string){
 const words=query.trim().toLocaleLowerCase("ko").split(/\s+/).filter(Boolean);
 const filtered=products.filter(p=>p.active&&(category==="all"||p.category===category)&&(theme==="전체"||p.tags.includes(theme))&&words.every(w=>[p.name,p.brand,p.description,...p.tags,categories.find(c=>c.id===p.category)?.label].join(" ").toLocaleLowerCase("ko").includes(w)));
 return sort==="new"?filtered.sort((a,b)=>b.addedAt.localeCompare(a.addedAt)):filtered;
}


export function productsWithClearedImages(products:Product[]){return products.filter(p=>p.active&&p.imageRights==="cleared");}

export function publicCatalog(content:SiteContent):SiteContent{
 return {...content,products:content.products.filter(p=>p.active).map(p=>({...p,image:p.imageRights==="cleared"?p.image:""}))};
}
