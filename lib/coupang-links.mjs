/** Official notice used wherever a visitor first encounters an affiliate item. */
export const AFFILIATE_DISCLOSURE = "이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";
/** @param {string} value */
export function isCoupangUrl(value){
 try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&((u.hostname==="www.coupang.com"&&/^\/vp\/products\/\d+\/?$/.test(u.pathname))||(u.hostname==="link.coupang.com"&&/^\/a\/[a-zA-Z0-9]+\/?$/.test(u.pathname)));}catch{return false;}
}
/** Detect supported affiliate URL forms; ownership and live validity need the partner portal. @param {string} value */
export function isAffiliateUrl(value){
 if(!isCoupangUrl(value))return false;
 const u=new URL(value);return u.hostname==="link.coupang.com"||!!u.searchParams.get("lptag");
}
