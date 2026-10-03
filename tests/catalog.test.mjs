import test from "node:test";
import assert from "node:assert/strict";
import {filterProducts,initialContent} from "../lib/catalog.ts";
import {isCoupangUrl,canAdmin,contentSchema} from "../lib/content-validation.ts";
test("only observed Coupang product and affiliate URL forms are accepted",()=>{
 for(const url of ["https://www.coupang.com/vp/products/123?itemId=5","https://link.coupang.com/a/abc123"])assert.equal(isCoupangUrl(url),true);
 for(const url of ["javascript:alert(1)","http://www.coupang.com/vp/products/123","https://coupang.com.evil.test/vp/products/123","https://www.coupang.com@evil.test/vp/products/123","https://www.coupang.com/search?q=x","https://www.coupang.com:999/vp/products/123","https://link.coupang.com/evil"])assert.equal(isCoupangUrl(url),false,url);
});
test("production administration fails closed without an exact owner",()=>{
 assert.equal(canAdmin(undefined,undefined,true),false);assert.equal(canAdmin("local_seedy",undefined,false),false);assert.equal(canAdmin("any",undefined,false),false);assert.equal(canAdmin("another","owner",false),false);assert.equal(canAdmin("owner","owner",false),true);assert.equal(canAdmin("local_seedy",undefined,true),true);assert.equal(canAdmin("local_seedy","owner",true),false);
});
test("seed has nineteen valid distinct products",()=>{assert.equal(initialContent.products.length,19);assert.equal(contentSchema.safeParse(initialContent).success,true);});
test("filters combine category, theme and multilingual case-insensitive words",()=>{
 assert.equal(filterProducts(initialContent.products,"PEBBLE 로지텍","digital","집의 재발견","recommended").length,1);
 assert.equal(filterProducts(initialContent.products,"PEBBLE","food","전체","recommended").length,0);
 assert.equal(filterProducts(initialContent.products,"","all","간편한 한 끼","recommended").length,9);
});
test("hidden products never appear and sorting does not mutate source",()=>{
 const products=structuredClone(initialContent.products);products[0].active=false;const before=JSON.stringify(products);
 assert.equal(filterProducts(products,"","all","전체","new").length,initialContent.products.length-1);assert.equal(JSON.stringify(products),before);
});
test("duplicate ids and untrusted links fail validation",()=>{
 const a=structuredClone(initialContent);a.products[1].id=a.products[0].id;assert.equal(contentSchema.safeParse(a).success,false);
 const b=structuredClone(initialContent);b.products[0].url="https://evil.test";assert.equal(contentSchema.safeParse(b).success,false);
});
test("affiliate links require a visible affiliate disclosure",()=>{
 const a=structuredClone(initialContent);a.affiliateActive=false;a.products[0].url="https://link.coupang.com/a/abc123";assert.equal(contentSchema.safeParse(a).success,false);a.affiliateActive=true;assert.equal(contentSchema.safeParse(a).success,true);
});
test("missing tags and invalid image schemes cannot be saved",()=>{
 const a=structuredClone(initialContent);a.products[0].tags=[];assert.equal(contentSchema.safeParse(a).success,false);
 const b=structuredClone(initialContent);b.products[0].image="data:text/html,x";assert.equal(contentSchema.safeParse(b).success,false);
});


import {filterDiscoveries,withinDays,sourceLabel} from "../lib/trends.ts";
const dated=structuredClone(initialContent.products.find(p=>p.id==="ninja-blast"));
test("rechecking an old social source never makes it a new weekly trend",()=>{
 dated.evidence[0].publishedAt="2025-07-30";dated.evidence[0].checkedAt="2026-10-02";
 assert.equal(filterDiscoveries([dated],"","all","전체","social","7","2026-10-02").length,0);
 assert.equal(filterDiscoveries([dated],"","all","전체","new","7","2026-10-02").length,1);
 assert.equal(sourceLabel(dated,"2026-10-02"),"지난 SNS 픽");
});
test("period boundaries are inclusive, future dates excluded and source types combine with categories",()=>{
 assert.equal(withinDays("2026-09-26",7,"2026-10-02"),true);
 assert.equal(withinDays("2026-09-25",7,"2026-10-02"),false);
 assert.equal(withinDays("2026-10-03",7,"2026-10-02"),false);
 assert.deepEqual(filterDiscoveries(initialContent.products,"","all","전체","coupang","7","2026-10-02").map(p=>p.id),["yiayia-olive"]);
 assert.equal(filterDiscoveries(initialContent.products,"","beauty","전체","coupang","all","2026-10-02").length,0);
});
test("evidence requires HTTPS, valid dates, a real summary and publication before checking",()=>{
 for(const change of [{url:"javascript:alert(1)"},{sourceName:""},{claim:""},{publishedAt:"2026-10-03",checkedAt:"2026-10-02"},{publishedAt:"2026-02-30"}]){
  const a=structuredClone(initialContent);a.products[0].evidence[0]={...a.products[0].evidence[0],...change};
  assert.equal(contentSchema.safeParse(a).success,false);
 }
 const legacy=structuredClone(initialContent);legacy.products.forEach(p=>{delete p.evidence;delete p.hook;delete p.editorialNote;});
 assert.equal(contentSchema.safeParse(legacy).success,true);
});


import {productsWithClearedImages} from "../lib/catalog.ts";
test("approved photo selection requires both active status and cleared image rights",()=>{
 const [approved,pending,hidden]=structuredClone(initialContent.products.slice(0,3));
 approved.active=true;approved.imageRights="cleared";pending.active=true;pending.imageRights="pending";hidden.active=false;hidden.imageRights="cleared";
 const source=[approved,pending,hidden],before=JSON.stringify(source);
 assert.deepEqual(productsWithClearedImages(source).map(p=>p.id),[approved.id]);
 assert.equal(JSON.stringify(source),before);
});
test("unreviewed starter images never become public by default",()=>{
 assert.equal(productsWithClearedImages(initialContent.products).length,0);
});


import {publicCatalog} from "../lib/catalog.ts";
test("visitor data keeps product details but removes every unapproved image URL",()=>{
 const content=structuredClone(initialContent),before=JSON.stringify(content);const result=publicCatalog(content);
 assert.equal(result.products.length,content.products.filter(p=>p.active).length);
 assert.ok(result.products.every(p=>p.image===""));
 assert.equal(result.products[0].url,content.products[0].url);
 assert.deepEqual(result.products[0].evidence,content.products[0].evidence);
 assert.equal(JSON.stringify(content),before);
 for(const p of content.products.filter(p=>p.image))assert.equal(JSON.stringify(result).includes(p.image),false);
});
test("cleared photos display, hidden products stay excluded, and source data remains untouched",()=>{
 const content=structuredClone(initialContent);content.products[0].imageRights="cleared";content.products[1].active=false;
 const result=publicCatalog(content);
 assert.equal(result.products[0].image,content.products[0].image);
 assert.equal(result.products.some(p=>p.id===content.products[1].id),false);
 assert.ok(content.products[2].image);
});


import {readLimitedBody} from "../lib/request-body.ts";
test("request body reader preserves Korean text split across byte chunks",async()=>{
 const bytes=new TextEncoder().encode("한글");let offset=0;
 const body=new ReadableStream({pull(controller){if(offset===bytes.length)controller.close();else controller.enqueue(bytes.slice(offset,++offset));}});
 assert.equal(await readLimitedBody(new Request("http://localhost",{method:"POST",body,duplex:"half"}),6),"한글");
 assert.equal(await readLimitedBody(new Request("http://localhost")),"");
});
test("request body reader limits bytes and cancels oversized streams",async()=>{
 let cancelled=false;const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode("한글"));},cancel(){cancelled=true;}});
 assert.equal(await readLimitedBody(new Request("http://localhost",{method:"POST",body,duplex:"half"}),5),null);assert.equal(cancelled,true);
});

import {isAffiliateUrl} from "../lib/coupang-links.mjs";
test("affiliate notices distinguish tracked product URLs from ordinary product URLs",()=>{
 for(const url of ["https://link.coupang.com/a/abc123","https://www.coupang.com/vp/products/123?itemId=5&lptag=AF_TEST"]){assert.equal(isAffiliateUrl(url),true,url);}
 for(const url of ["https://www.coupang.com/vp/products/123?itemId=5","https://www.coupang.com/vp/products/123?lptag=","https://link.coupang.com.evil.test/a/abc123","https://www.coupang.com@evil.test/vp/products/123?lptag=AF_TEST"]){assert.equal(isAffiliateUrl(url),false,url);}
});
test("expanded affiliate URLs cannot bypass disclosure validation but hidden items are allowed",()=>{
 const content=structuredClone(initialContent);content.affiliateActive=false;content.products.forEach(p=>{if(isAffiliateUrl(p.url))p.active=false;});content.products[0].url="https://www.coupang.com/vp/products/123?lptag=AF_TEST";
 assert.equal(contentSchema.safeParse(content).success,false);
 content.products[0].active=false;assert.equal(contentSchema.safeParse(content).success,true);
 content.products[0].active=true;content.affiliateActive=true;assert.equal(contentSchema.safeParse(content).success,true);
});
test("pending photos can be blank without removing products and cleared photos need an address",()=>{
 const content=structuredClone(initialContent);content.products[0].image="";content.products[0].imageRights="pending";
 assert.equal(contentSchema.safeParse(content).success,true);
 assert.equal(publicCatalog(content).products.length,19);
 content.products[0].imageRights="cleared";assert.equal(contentSchema.safeParse(content).success,false);
 content.products[0].image="https://example.com/authorized.jpg";assert.equal(contentSchema.safeParse(content).success,true);
});
