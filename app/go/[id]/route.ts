import {readContent,publicCatalog} from "@/lib/content-store";
import {isCoupangUrl} from "@/lib/content-validation";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {published}=await readContent();const product=publicCatalog(published).products.find(p=>p.id===id&&p.active);
 if(!product||!isCoupangUrl(product.url))return new Response("상품을 찾을 수 없어요. 요즘픽 홈에서 다시 골라주세요.",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});
 return new Response(null,{status:302,headers:{Location:product.url,"Cache-Control":"no-store","Referrer-Policy":"strict-origin-when-cross-origin"}});
}
