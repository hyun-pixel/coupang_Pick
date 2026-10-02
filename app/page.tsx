import {Storefront} from "@/components/storefront";
import {readContent,publicCatalog} from "@/lib/content-store";
export const dynamic="force-dynamic";
export default async function Home(){const state=await readContent();return <Storefront content={publicCatalog(state.published)}/>;}
