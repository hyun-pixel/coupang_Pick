import Link from "next/link";
import {adminIdentity,readContent} from "@/lib/content-store";
import {supabaseSettings} from "@/lib/server-config";
import {AdminEditor} from "@/components/admin-editor";
export const dynamic="force-dynamic";
export const metadata={title:"운영자 스튜디오 | 요즘픽",robots:{index:false,follow:false}};
export default async function AdminPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {user,allowed,local}=await adminIdentity();
 if(allowed){const state=await readContent();return <AdminEditor initial={state} local={local} signOutUrl="/admin/logout"/>;}
 const settings=supabaseSettings(),{error}=await searchParams;
 const message=error==="login"?"이메일과 비밀번호를 확인해 주세요.":error==="denied"?"운영자로 등록된 계정으로 로그인해 주세요.":error==="connection"?"로그인 서비스에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.":error==="setup"?"운영자 연결 설정을 먼저 완료해 주세요.":"";
 return <main className="admin-gate"><Link prefetch={false} href="/" className="brand">요즘픽.</Link><p className="eyebrow blue">EDITOR’S STUDIO</p><h1>운영자만의 작업 공간</h1><p>상품을 고르고, 이야기를 더하고, 다음 발견을 준비하세요.</p>
 {message&&<p role="alert" className="admin-login-error">{message}</p>}
 {user?<div className="admin-notice"><p>이 계정은 운영자로 등록되지 않았어요.</p><a href="/admin/logout">다른 계정으로 로그인</a></div>:local?<form action="/api/admin/session" method="post" className="admin-login"><input type="hidden" name="action" value="local"/><button className="primary-button">로컬 운영자 체험하기</button><p className="admin-small">이 컴퓨터의 개발 화면에서만 사용하는 로그인입니다.<br/>편집 내용은 이 컴퓨터에 저장됩니다.</p></form>:settings.authReady&&settings.storageReady?<form action="/api/admin/session" method="post" className="admin-login"><input type="hidden" name="action" value="login"/><label>이메일<input name="email" type="email" autoComplete="username" maxLength={254} required/></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" maxLength={256} required/></label><button className="primary-button">운영자로 로그인</button><p className="admin-small">미리 등록한 운영자 계정만 편집할 수 있습니다.</p></form>:<div className="admin-notice"><h2>운영자 설정이 필요해요</h2><p>방문자 페이지는 공개할 수 있습니다. 온라인 상품 편집을 사용하려면 배포 안내 문서에 따라 Supabase 저장소와 운영자 계정을 연결해 주세요.</p></div>}
 <Link prefetch={false} className="back-link" href="/">방문자 화면 보기</Link></main>;
}
