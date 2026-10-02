"use client";
import {useState} from "react";
import {ImageOff} from "lucide-react";
export function DiscoveryImage({src,alt,priority=false}:{src:string;alt:string;priority?:boolean}){
 const [failedSrc,setFailedSrc]=useState<string|null>(null);
 if(!src)return null;
 if(failedSrc===src)return <span className="discovery-image-fallback"><ImageOff size={28}/><span>사진을 불러오지 못했어요</span></span>;
 return <img ref={node=>{if(node?.complete&&!node.naturalWidth)setFailedSrc(src)}} src={src} alt={alt} width={600} height={600} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} onError={()=>setFailedSrc(src)}/>;
}
