// Consume a bounded body even when a request will be rejected, so local Workers
// can finish the request without holding the next connection open.
export async function readLimitedBody(request:Request,limit=1_000_000):Promise<string|null>{
 const reader=request.body?.getReader();if(!reader)return "";
 const decoder=new TextDecoder();let raw="",size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return null;}raw+=decoder.decode(value,{stream:true});}return raw+decoder.decode();}
 finally{reader.releaseLock();}
}
