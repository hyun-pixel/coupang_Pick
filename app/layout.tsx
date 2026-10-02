import type { Metadata } from "next";
import "./globals.css";
import "./discovery.css";
export const metadata: Metadata = {
 title: "요즘픽 — 쿠팡 가기 전, 요즘 뭐 뜨는지",
 description: "SNS에서 포착한 아이템부터 쿠팡 소식까지. 출처와 주목한 이유를 함께 보는 쇼핑 트렌드 노트, 요즘픽.",
 other: {"codex-preview":"development"}, icons: {icon:"/favicon.svg",shortcut:"/favicon.svg"}
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="ko"><body className="antialiased">{children}</body></html>;
}
