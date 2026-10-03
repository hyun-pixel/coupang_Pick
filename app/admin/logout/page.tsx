import Link from "next/link";
export const metadata={title:"운영자 로그아웃 | 요즘픽",robots:{index:false,follow:false}};
export default function Logout(){return <main className="admin-gate"><Link prefetch={false} href="/" className="brand">요즘픽.</Link><h1>로그아웃할까요?</h1><p>저장한 초안은 그대로 보관됩니다.</p><form action="/api/admin/session" method="post" className="admin-login"><input type="hidden" name="action" value="logout"/><button className="primary-button">로그아웃</button></form><Link prefetch={false} className="back-link" href="/admin">편집으로 돌아가기</Link></main>;}
