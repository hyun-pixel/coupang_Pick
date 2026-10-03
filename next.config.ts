import type {NextConfig} from "next";
const config:NextConfig={
 agentRules:false,outputFileTracingExcludes:{"/*":["./.local/**/*","./.wrangler/**/*","./preview/**/*","./work/**/*"]}};
export default config;
