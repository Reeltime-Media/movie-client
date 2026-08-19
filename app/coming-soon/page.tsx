import { ComingSoonView } from "@/components/catalog/ComingSoonView";
import { listComingSoon } from "@/lib/api/movies";
import { swallow } from "@/lib/log";

export default async function ComingSoonPage() {
  const items = await listComingSoon().catch(swallow("coming-soon: load list", []));

  return <ComingSoonView items={items} />;
}
