import "server-only";
import {createClient} from "@supabase/supabase-js";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import {supabaseSettings} from "./server-config";
export function contentClient(){
 const {url,secretKey}=supabaseSettings();
 if(!url||!secretKey)throw new Error("Supabase content storage is not configured.");
 return createClient(url,secretKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store"})}});
}
export async function authClient(){
 const {url,publishableKey}=supabaseSettings();if(!url||!publishableKey)throw new Error("Supabase authentication is not configured.");
 const cookieStore=await cookies();
 return createServerClient(url,publishableKey,{cookieOptions:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"},cookies:{
  getAll:()=>cookieStore.getAll(),
  setAll(values){try{values.forEach(({name,value,options})=>cookieStore.set(name,value,options));}catch{/* Server Components are read-only; proxy.ts refreshes cookies. */}}
 }});
}
