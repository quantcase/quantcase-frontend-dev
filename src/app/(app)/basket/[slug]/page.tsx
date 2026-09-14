import { notFound } from "next/navigation";
import { SAMPLE_BASKETS } from "../_data/sample-baskets";
import { normalizeBaskets } from "../_lib/utils";
import { BasketDetailView } from "../_components/basket-detail-view";

const ALL = normalizeBaskets(SAMPLE_BASKETS);

export default async function BasketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const basket = ALL.find((b) => b.slug === decodeURIComponent(slug));
  if (!basket) notFound();
  return <BasketDetailView basket={basket} />;
}
