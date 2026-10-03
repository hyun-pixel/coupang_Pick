export const isLocalDev=process.env.NODE_ENV==="development"&&!process.env.VERCEL;
export const LOCAL_ADMIN_COOKIE="yp_local_editor";
export function supabaseSettings(){
 const url=process.env.SUPABASE_URL,publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY,secretKey=process.env.SUPABASE_SECRET_KEY,ownerId=process.env.ADMIN_USER_ID;
 return {url,publishableKey,secretKey,ownerId,anyConfigured:!!(url||publishableKey||secretKey||ownerId),storageReady:!!(url&&secretKey),authReady:!!(url&&publishableKey&&ownerId)};
}
export function localRequestAllowed(host:string|null){return isLocalDev&&!!host&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);}
