import "server-only";
import {cookies,headers} from "next/headers";
import {authClient} from "./supabase-server";
import {supabaseSettings,localRequestAllowed,LOCAL_ADMIN_COOKIE} from "./server-config";
export async function adminIdentity(){
 const settings=supabaseSettings();
 if(!settings.anyConfigured){
  const local=localRequestAllowed((await headers()).get("host"));
  const allowed=local&&(await cookies()).get(LOCAL_ADMIN_COOKIE)?.value==="active";
  return {user:allowed?{userId:"local_seedy"}:null,allowed,local};
 }
 if(!settings.authReady||!settings.storageReady)return {user:null,allowed:false,local:false};
 const client=await authClient();const {data:{user},error}=await client.auth.getUser();
 return {user:user?{userId:user.id}:null,allowed:!error&&!!user&&user.id===settings.ownerId,local:false};
}
