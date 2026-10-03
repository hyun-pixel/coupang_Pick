import Link from "next/link";
export default function NotFound(){return <main className="admin-gate"><Link prefetch={false} href="/" className="brand">요즘픽.</Link><h1>이 페이지는 찾지 못했어요</h1><p>홈에서 새로운 발견을 이어가세요.</p><Link prefetch={false} className="primary-button" href="/">요즘픽 홈으로</Link></main>}
