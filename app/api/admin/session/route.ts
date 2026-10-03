import {requestOrigin} from "@/lib/request-origin";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {authClient} from "@/lib/supabase-server";
import {supabaseSettings,localRequestAllowed,LOCAL_ADMIN_COOKIE} from "@/lib/server-config";
import {readLimitedBody} from "@/lib/request-body";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 const go=(path:string)=>{const response=NextResponse.redirect(new URL(path,requestOrigin(request)),303);response.headers.set("Cache-Control","private, no-store");return response;};
 if(request.headers.get("origin")!==requestOrigin(request))return new Response("요청 출처를 확인해 주세요.",{status:403});
 if(!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))return new Response("요청 형식을 확인해 주세요.",{status:415});
 let raw:string|null;try{raw=await readLimitedBody(request,4096);}catch{return new Response("요청을 읽지 못했어요.",{status:400});}
 if(raw===null)return new Response("입력 내용이 너무 길어요.",{status:413});
 const form=new URLSearchParams(raw),action=form.get("action"),settings=supabaseSettings();
 if(action==="local"){
  if(settings.anyConfigured||!localRequestAllowed(request.headers.get("host")))return new Response("허용되지 않은 로그인입니다.",{status:403});
  (await cookies()).set(LOCAL_ADMIN_COOKIE,"active",{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:8*60*60});return go("/admin");
 }
 if(action==="logout"){
  if(settings.authReady){const client=await authClient();await client.auth.signOut({scope:"local"});}
  (await cookies()).delete(LOCAL_ADMIN_COOKIE);return go("/admin");
 }
 if(action!=="login")return new Response("로그인 요청을 확인해 주세요.",{status:400});
 if(!settings.authReady||!settings.storageReady)return go("/admin?error=setup");
 const email=form.get("email")?.trim()??"",password=form.get("password")??"";
 if(!email||email.length>254||!password||password.length>256)return go("/admin?error=login");
 try{
  const client=await authClient();const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error||!data.user)return go("/admin?error=login");
  if(data.user.id!==settings.ownerId){await client.auth.signOut({scope:"local"});return go("/admin?error=denied");}
  return go("/admin");
 }catch{return go("/admin?error=connection");}
}
