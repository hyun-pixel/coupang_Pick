"use client";
import { useEffect,useState } from "react";
import { Search,X,ShoppingBag,Share2,Check,Flame,Clock3,LayoutGrid,Layers3,Utensils,Leaf,House,CookingPot,Droplets,Headphones,BookOpen,ExternalLink } from "lucide-react";
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetClose } from "@/components/ui/sheet";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { categories,themes,type Product,type SiteContent } from "@/lib/catalog";
import { signals,filterDiscoveries,evidenceFor,sourceLabel,shortDate,latestCheck,withinDays,type Signal } from "@/lib/trends";
import { registerCatalogTool } from "@/lib/catalog-tool";
import { AFFILIATE_DISCLOSURE,isAffiliateUrl } from "@/lib/coupang-links.mjs";
import { DiscoveryImage } from "./discovery-image";
const icons=[Utensils,Leaf,House,CookingPot,Droplets,Headphones];
const categoryName=(p:Product)=>categories.find(c=>c.id===p.category)?.label;
function AffiliateNotice({className=""}:{className?:string}){return <aside className={"yp-disclosure "+className} aria-label="쿠팡 파트너스 광고 안내"><strong>광고 · 쿠팡 파트너스</strong><p>{AFFILIATE_DISCLOSURE}</p></aside>;}
export function Storefront({content,preview=false}:{content:SiteContent;preview?:boolean}){
 const [category,setCategory]=useState("all"),[theme,setTheme]=useState("전체"),[query,setQuery]=useState(""),[signal,setSignal]=useState<Signal>("all"),[period,setPeriod]=useState("all"),[selected,setSelected]=useState<Product|null>(null),[coverIndex,setCoverIndex]=useState(0),[shareMessage,setShareMessage]=useState(""),[shareFallback,setShareFallback]=useState("");
 const [visibleCount,setVisibleCount]=useState(8);
 useEffect(()=>setVisibleCount(8),[category,theme,query,signal,period]);
 const today=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Seoul"});
 const active=content.products.filter(p=>p.active);
 const hasAffiliateLinks=active.some(p=>isAffiliateUrl(p.url));
 const covers=[...active].sort((a,b)=>(evidenceFor(b)[0]?.publishedAt??"").localeCompare(evidenceFor(a)[0]?.publishedAt??"")).slice(0,3);
 const cover=covers[coverIndex]??covers[0];
 const products=filterDiscoveries(content.products,query,category,theme,signal,period,today);
 const checked=latestCheck(active);
 useEffect(()=>{
  const sync=()=>{const id=new URL(location.href).searchParams.get("pick");setSelected(content.products.find(p=>p.active&&p.id===id)??null);setShareMessage("");setShareFallback("");};
  sync();window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync);
 },[content.products]);
 useEffect(()=>registerCatalogTool(content.products,(v)=>{setQuery(v.query);setCategory(v.category);setTheme(v.theme);setSignal("all");setPeriod("all");document.getElementById("picks")?.scrollIntoView();}),[content.products]);
 function scrollToPicks(){document.getElementById("picks")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}
 function explore(nextSignal:Signal="all",nextCategory="all",nextTheme="전체"){setSignal(nextSignal);setCategory(nextCategory);setTheme(nextTheme);setQuery("");setPeriod("all");scrollToPicks();}
 function reset(){setCategory("all");setTheme("전체");setQuery("");setSignal("all");setPeriod("all");}
 function showProduct(product:Product|null){
  setSelected(product);setShareMessage("");setShareFallback("");
  const url=new URL(location.href);if(product)url.searchParams.set("pick",product.id);else url.searchParams.delete("pick");
  history.pushState(null,"",url.pathname+url.search+url.hash);
 }
 async function shareProduct(product:Product){
  const url=new URL(location.href);url.pathname="/";url.search="";url.hash="";url.searchParams.set("pick",product.id);
  try{await navigator.clipboard.writeText(url.href);setShareMessage(location.hostname==="127.0.0.1"||location.hostname==="localhost"?"링크를 복사했어요. 지금은 이 컴퓨터에서만 열려요.":"링크를 복사했어요. 발견을 함께 나눠보세요.");}
  catch{setShareFallback(url.href);setShareMessage("아래 주소를 선택해 복사해 주세요.");}
 }

 return <div className="discovery-site">
 <a href="#main" className="skip-link">본문으로 건너뛰기</a>
 {preview&&<div className="preview-banner">저장된 초안 미리보기 <a href="/admin">편집으로 돌아가기</a></div>}
 <header className="yp-header"><div className="yp-width yp-header-inner">
 <a href="/" className="brand" aria-label="요즘픽 홈"><span className="brand-mark">y<span>p</span></span>요즘픽<span className="brand-dot"/></a>
 <nav className="yp-topnav" aria-label="주 메뉴"><button onClick={()=>explore()} className="is-current">트렌드 픽</button><button onClick={()=>explore("new")}>새로 담은</button><a href="#collections">발견 모음집</a></nav>
 <form className="yp-search" role="search" onSubmit={e=>{e.preventDefault();scrollToPicks();}}><Search size={19}/><input aria-label="상품 검색" placeholder="나만 몰랐던 아이템 찾기" value={query} onChange={e=>{setQuery(e.target.value);}}/>{query&&<button type="button" aria-label="검색어 지우기" onClick={()=>setQuery("")}><X size={17}/></button>}</form>
 </div></header>
 <main id="main">
 {hasAffiliateLinks&&<AffiliateNotice/>}
 <section className="yp-width yp-intro" aria-labelledby="hero-title"><div><p className="yp-kicker">YOUR NEXT GOOD FIND</p><h1 id="hero-title">{content.heroTitle.split("\n").map((line,i)=><span key={i}>{line}</span>)}</h1></div><div className="yp-intro-note"><p>{content.heroDescription}</p><div className="yp-edition"><span>쇼핑 전에 들르는 트렌드 노트</span>{checked&&<span>최근 확인 <time dateTime={checked}>{checked.replaceAll("-",".")}</time></span>}</div></div></section>
 {cover&&<section className="yp-width yp-cover-grid" aria-label="눈여겨볼 트렌드">
 <article className={"yp-cover yp-tone-"+cover.category} key={cover.id}>
 <div className="yp-cover-copy"><div className="yp-cover-meta"><span className="yp-label"><Flame size={15}/>{sourceLabel(cover,today)}</span><span>{categoryName(cover)}</span></div><h2>{cover.hook||cover.name}</h2><p>{evidenceFor(cover)[0]?.claim||cover.description}</p><button className="yp-dark-button" onClick={()=>showProduct(cover)}>주목한 이유 보기 <BookOpen size={17}/></button><div className="yp-cover-source">{evidenceFor(cover)[0]?<>{evidenceFor(cover)[0].sourceName} · {evidenceFor(cover)[0].publishedAt.replaceAll("-",".")} 발행</>:<>상품 특징을 살펴 고른 에디터 추천</>}</div></div>
 <button className="yp-cover-photo" onClick={()=>showProduct(cover)} aria-label={cover.name+" 자세히 보기"}><span className="yp-cover-word" aria-hidden="true">PICK!</span><DiscoveryImage src={cover.image} alt={cover.name} priority/><span className="yp-cover-caption">{cover.brand}<br/><strong>{cover.name}</strong></span></button>
 </article>
 <aside className="yp-cover-aside"><div className="yp-aside-heading"><span>이번에 눈여겨볼 픽</span><span>{String(coverIndex+1).padStart(2,"0")} / {String(covers.length).padStart(2,"0")}</span></div><div className="yp-cover-options">{covers.map((p,i)=><button key={p.id} className="yp-cover-option" aria-pressed={coverIndex===i} onClick={()=>setCoverIndex(i)}><span className={"yp-mini-photo yp-tone-"+p.category}><DiscoveryImage src={p.image} alt=""/></span><span><span className="yp-option-label">{sourceLabel(p,today)}</span><strong>{p.hook||p.name}</strong><span className="yp-option-date">{evidenceFor(p)[0]?evidenceFor(p)[0].publishedAt.replaceAll("-",".")+" 발행":shortDate(p.addedAt)+" 등록"}</span></span><span className="yp-option-dot" aria-hidden="true"/></button>)}</div><a className="yp-method-link" href="/about"><BookOpen size={16}/><span>트렌드의 출처까지 함께 봐요</span></a></aside>
 </section>}
 <div className="yp-width yp-topic-strip"><span>어디서 발견할까요?</span>{categories.map((c,i)=>{const Icon=icons[i];return <button key={c.id} onClick={()=>explore("all",c.id)}><Icon size={19}/>{c.label}</button>})}</div>
 <section className="yp-width yp-feed" id="picks" aria-labelledby="picks-title">
 <div className="yp-section-heading"><div><span className="yp-section-index">THE PICK LIST</span><h2 id="picks-title">{signal==="new"?"새로 담은 발견":"지금, 눈여겨볼 것들"}<span className="yp-title-spark" aria-hidden="true">✳</span></h2><p>{signal==="new"?"요즘픽에 새로 추가한 순서로 만나보세요.":"SNS의 한 장면부터 쿠팡 소식까지. 이유를 알고, 취향대로 발견해요."}</p></div><a href="/about">어떤 기준으로 고르나요?</a></div>
 {hasAffiliateLinks&&<AffiliateNotice className="yp-feed-disclosure"/>}
 <div className="yp-signal-tabs" aria-label="발견 출처">{signals.map(s=><button key={s.id} aria-pressed={signal===s.id} onClick={()=>{setSignal(s.id);setPeriod("all");}}>{s.id==="social"?<Flame size={17}/>:s.id==="new"?<Clock3 size={17}/>:null}{s.label}</button>)}</div>
 <div id="categories" className="yp-filter-area"><div className="yp-category-chips" aria-label="상품 카테고리"><button aria-pressed={category==="all"} onClick={()=>setCategory("all")}>전체</button>{categories.map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}>{c.label}</button>)}</div><Select value={period} onValueChange={setPeriod}><SelectTrigger className="yp-period" aria-label="자료 기간"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">전체 기간</SelectItem><SelectItem value="7">최근 7일</SelectItem><SelectItem value="30">최근 30일</SelectItem></SelectContent></Select></div>
 <div className="yp-results"><span aria-live="polite">{query&&<strong>‘{query}’ </strong>}{theme!=="전체"&&<strong>{theme} · </strong>}<b>{products.length}</b>개의 발견</span><span>{period==="all"?(signal==="new"?"요즘픽 등록일순":"에디터 선정 · 판매 순위가 아니에요"):(signal==="new"?"요즘픽 등록일 기준":"출처 발행일 기준 · 에디터 발견은 등록일 기준")}</span>{(query||category!=="all"||theme!=="전체"||signal!=="all"||period!=="all")&&<button onClick={reset}>초기화 <X size={14}/></button>}</div>
 {products.length?<div className="yp-product-grid">{products.slice(0,visibleCount).map((p,i)=>{const evidence=evidenceFor(p)[0];return <article key={p.id} className="yp-product" style={{"--delay":Math.min(i,5)*35+"ms"} as React.CSSProperties}>
 {isAffiliateUrl(p.url)&&<p className="yp-card-ad">광고 · 제휴 링크</p>}
 <button className={"yp-product-photo yp-tone-"+p.category} onClick={()=>showProduct(p)} aria-label={(p.hook||p.name)+" 자세히 보기"}><span className="yp-card-category">{categoryName(p)}</span><DiscoveryImage src={p.image} alt={p.name}/><span className="yp-photo-action"><BookOpen size={17}/> 발견 노트</span></button>
 <div className="yp-product-body"><div className="yp-card-source"><span className={"yp-source-"+(evidence?.kind??"editor")}>{sourceLabel(p,today)}</span><span>{evidence?evidence.publishedAt.replaceAll("-",".")+" 발행":shortDate(p.addedAt)+" 등록"}</span></div><button className="yp-product-title" onClick={()=>showProduct(p)}><h3>{p.hook||p.name}</h3></button><p className="yp-product-name">{p.brand} · {p.name}</p><p className="yp-product-summary">{evidence?.claim||p.description}</p><div className="yp-card-bottom"><a href={p.url} target="_blank" rel={isAffiliateUrl(p.url)?"nofollow sponsored noopener":"nofollow noopener"} referrerPolicy="strict-origin-when-cross-origin"><ShoppingBag size={16}/>쿠팡에서 보기<span className="sr-only"> (새 창)</span></a><button onClick={()=>showProduct(p)} aria-label={p.name+" 근거와 추천 이유 보기"}><BookOpen size={17}/><span>이유</span></button></div></div>
 </article>})}</div>:<div className="yp-empty"><Search size={32}/><h3>{active.length?"이 조건의 발견은 아직 없어요":"새로운 발견을 준비하고 있어요"}</h3><p>{active.length?<>다른 카테고리나 전체 기간으로 둘러보세요.<br/>확인한 출처가 있는 아이템부터 차근차근 담을게요.</>:<>소개할 아이템의 사진과 정보를 확인하고 있어요.<br/>준비가 끝난 발견부터 이곳에 담겠습니다.</>}</p>{active.length>0&&<button className="yp-dark-button" onClick={reset}>전체 발견 보기</button>}</div>}
 {products.length>visibleCount&&<div className="yp-load-more"><span>{Math.min(visibleCount,products.length)} / {products.length}개의 발견</span><button onClick={()=>setVisibleCount(n=>n+8)}>다음 발견 {Math.min(8,products.length-visibleCount)}개 더 보기</button></div>}
 <p className="yp-catalog-note">가격·재고·배송과 상품 옵션은 쿠팡에서 확인해 주세요. 출처의 발행일과 요즘픽의 확인일은 다를 수 있어요.</p>
 </section>
 <section id="collections" className="yp-width yp-collections" aria-labelledby="collections-title"><div className="yp-section-heading"><div><span className="yp-section-index">FOLLOW YOUR MOOD</span><h2 id="collections-title">발견에도, 취향이 있으니까.</h2><p>마음 가는 주제로 한 번 더 둘러보세요.</p></div></div><div className="yp-collection-grid">{themes.slice(1).map((t,i)=>{const p=active.find(p=>p.tags.includes(t));return <button key={t} className={"yp-collection yp-collection-"+i} onClick={()=>explore("all","all",t)}><div><span>COLLECTION 0{i+1}</span><h3>{i===0?content.themeTitle:i===1?"집에 이런 게\n있으면 좋겠다.":"나를 챙기는\n작은 취향."}</h3><p>{t} 모아보기</p></div>{p&&<DiscoveryImage src={p.image} alt=""/>}</button>})}</div></section>
 <section className="yp-width yp-manifesto"><span className="yp-manifesto-mark" aria-hidden="true">yp.</span><div><h2>유행은 빠르게.<br/>고르는 건, 나답게.</h2><p>무조건 좋다는 말보다, 어디서 왜 주목받았는지.<br/>요즘픽은 발견의 이유까지 함께 담습니다.</p></div><a href="/about">요즘픽의 추천 기준 읽기 <BookOpen size={17}/></a></section>
 </main>
 <footer className="yp-width yp-footer"><div><a className="brand" href="/">요즘픽<span className="brand-dot"/></a><p>쿠팡 가기 전, 요즘픽.</p></div><div><p>{hasAffiliateLinks?"제휴 상품에는 광고 안내를 표시합니다. 일반 상품 링크에서는 제휴 수익이 발생하지 않습니다.":"현재 일반 상품 링크로 연결되며 제휴 수익은 발생하지 않습니다."}</p><p>요즘픽은 쿠팡이 운영하는 공식 서비스가 아닌 독립적인 상품 큐레이션 사이트입니다.</p><p>요즘픽은 판매처가 아닙니다. 주문·배송·교환·환불은 해당 판매처에서 진행됩니다.</p><div className="yp-footer-links"><span>© {new Date().getFullYear()} YOJEUMPICK</span><a href="/about">추천 기준·이용 안내</a><a href="/admin">운영자</a></div></div></footer>
 <nav className="yp-mobile-nav" aria-label="모바일 메뉴"><button onClick={()=>explore()}><Flame size={21}/>트렌드</button><button onClick={()=>explore("new")}><Clock3 size={21}/>새로 담은</button><a href="#categories"><LayoutGrid size={21}/>카테고리</a><a href="#collections"><Layers3 size={21}/>모음집</a></nav>
 <Sheet open={!!selected} onOpenChange={open=>{if(!open)showProduct(null)}}><SheetContent className="yp-sheet" showCloseButton={false}><SheetClose className="yp-sheet-close" aria-label="상품 정보 닫기"><X size={23}/></SheetClose>{selected&&<>
 {isAffiliateUrl(selected.url)&&<AffiliateNotice className="yp-detail-disclosure"/>}
 <div className={"yp-sheet-photo yp-tone-"+selected.category}><DiscoveryImage src={selected.image} alt={selected.name}/></div>
 <SheetHeader><span className="yp-label">{sourceLabel(selected,today)}</span><SheetTitle>{selected.hook||selected.name}</SheetTitle><SheetDescription>{selected.brand} · {selected.name}<br/>{selected.unit}</SheetDescription></SheetHeader>
 <div className="yp-sheet-body"><section><h3>이 아이템의 포인트</h3><p>{selected.description}</p></section>
 {evidenceFor(selected).length>0?<section className="yp-evidence"><h3>어디서, 왜 주목했을까요?</h3>{evidenceFor(selected).map((e,i)=><article key={i}><div className="yp-evidence-top"><strong>{e.sourceName}</strong>{!withinDays(e.publishedAt,90,today)&&<span>지난 트렌드 기록</span>}</div><p>{e.claim}</p>{e.scope==="category"&&<p className="yp-scope-note">관련 제품군에 대한 소식입니다. 이 상품 자체의 인기나 판매량을 뜻하지 않아요.</p>}<div className="yp-evidence-date"><span>출처 발행 {e.publishedAt}</span><span>요즘픽 확인 {e.checkedAt}</span></div><a href={e.url} target="_blank" rel="noopener noreferrer">출처 원문 읽기 <ExternalLink size={14}/><span className="sr-only"> (새 창)</span></a></article>)}</section>:<p className="yp-editor-disclaimer">상품 특징을 바탕으로 고른 에디터 추천이에요. SNS 유행이나 쿠팡 판매 순위가 확인된 상품은 아닙니다.</p>}
 {selected.editorialNote&&<section><h3>요즘픽의 한마디</h3><p>{selected.editorialNote}</p></section>}
 <div className="yp-sheet-tags">{selected.tags.map(t=><button key={t} onClick={()=>{showProduct(null);explore("all","all",t)}}>#{t.replaceAll(" ","")}</button>)}</div>
 <button className="yp-share-button" onClick={()=>shareProduct(selected)}><Share2 size={17}/>이 발견 링크 복사하기</button>
 {shareMessage&&<p className="yp-share-message" role="status"><Check size={16}/>{shareMessage}</p>}{shareFallback&&<input className="yp-share-fallback" aria-label="공유할 상품 주소" readOnly value={shareFallback} onFocus={e=>e.target.select()}/>}
 <p className="yp-sheet-note">직접 사용한 후기가 아닌 공개 자료와 상품 특징을 바탕으로 작성했습니다. 구매 전 최신 구성·원재료·사용법을 판매 페이지에서 확인해 주세요.</p>

 </div><div className="yp-sheet-cta"><a href={selected.url} target="_blank" rel={isAffiliateUrl(selected.url)?"nofollow sponsored noopener":"nofollow noopener"} referrerPolicy="strict-origin-when-cross-origin"><ShoppingBag size={19}/>쿠팡에서 가격·옵션 확인<span className="sr-only"> (새 창)</span></a><span>{isAffiliateUrl(selected.url)?"쿠팡 파트너스 제휴 링크 · 새 창으로 이동":"일반 상품 링크 · 제휴 수익 없음"}</span></div></>}</SheetContent></Sheet>
 </div>;
}
