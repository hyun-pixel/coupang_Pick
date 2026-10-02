import {adminIdentity,isLocalDev,readContent} from "@/lib/content-store";
import {chatGPTSignInPath,chatGPTSignOutPath} from "@/app/chatgpt-auth";
import {AdminEditor} from "@/components/admin-editor";
export const dynamic="force-dynamic";
export const metadata={title:"운영자 스튜디오 | 요즘픽",robots:{index:false,follow:false}};
export default async function AdminPage(){
 const {user,allowed}=await adminIdentity();
 if(!allowed)return <main className="admin-gate"><a href="/" className="brand">요즘픽.</a><p className="eyebrow blue">EDITOR’S STUDIO</p><h1>운영자만의 작업 공간</h1><p>상품을 고르고, 이야기를 더하고, 다음 발견을 준비하세요.</p>{user?<div className="admin-notice"><p>이 계정은 아직 운영자로 등록되지 않았어요.</p><p>운영자 설정에 사용할 계정 ID: <code>{user.userId}</code></p><a href={chatGPTSignOutPath("/admin")}>다른 계정으로 로그인</a></div>:<><a className="primary-button" href={chatGPTSignInPath("/admin")}>{isLocalDev?"로컬 운영자 체험하기":"ChatGPT로 운영자 로그인"}</a>{isLocalDev&&<p className="admin-small">현재는 이 컴퓨터에서만 동작하는 체험용 로그인입니다.<br/>공개 사이트에는 본인 계정만 별도로 등록해야 합니다.</p>}</>}<a className="back-link" href="/">방문자 화면 보기</a></main>;
 const state=await readContent();return <AdminEditor initial={state} local={isLocalDev} signOutUrl={chatGPTSignOutPath("/")}/>;
}
