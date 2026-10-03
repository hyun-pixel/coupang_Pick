// Next.js may normalize the internal URL hostname; use the received Host for browser origin checks.
export function requestOrigin(request:Request){
 const url=new URL(request.url),host=request.headers.get("host");
 if(host)url.host=host;
 return url.origin;
}
