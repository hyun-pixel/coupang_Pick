import {adminIdentity,readContent,publicCatalog} from "@/lib/content-store";
import {Storefront} from "@/components/storefront";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"초안 미리보기 | 요즘픽",robots:{index:false,follow:false}};
export default async function PreviewPage({searchParams}:{searchParams:Promise<{mode?:string}>}){
 const {allowed}=await adminIdentity();if(!allowed)redirect("/admin");
 const {draft}=await readContent();const publicMode=(await searchParams).mode==="public";
 const content=publicCatalog(draft);const blankCount=content.products.filter(p=>!p.image).length;
 return <>{publicMode&&<aside className="public-preview-notice" aria-label="공개 화면 미리보기 안내"><div><strong>상품 {content.products.length}개 · 사진 {blankCount}개 공란</strong><p>사용권 확인 전 사진은 불러오지 않습니다. 상품 설명·출처·쿠팡 링크는 표시됩니다. 이 화면은 배포 전 미리보기입니다.</p><a href="/admin">편집으로 돌아가기</a></div></aside>}<Storefront content={content} preview/></>;
}
