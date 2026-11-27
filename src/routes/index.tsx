import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/storefront/store-layout";
import { HomeHero } from "@/components/storefront/home-hero";
import { CategoryStrip } from "@/components/storefront/home-sections";
import { FeaturedObjects } from "@/components/storefront/home-featured";
import { HomeStudioCard } from "@/components/storefront/home-studio";
import { SetupCheck } from "@/components/setup-check";
import { isEmptyDatabaseError } from "@/lib/supabase/health";
import { supabaseConfigProblem } from "@/lib/supabase/client";
import { storeSettingsQuery } from "@/lib/queries";
import { EMPTY_FILTERS, cataloguePageQuery, useCataloguePage } from "@/lib/catalogue";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // Prefetch both so SSR emits the store name and the catalogue instead of an
    // empty shell. Failures are swallowed: a missing database must render the
    // setup guidance, not a 500.
    const settings = await context.queryClient
      .ensureQueryData(storeSettingsQuery())
      .catch(() => null);
    // The product grid is the page. Without this the server HTML ships an
    // empty grid and the buyer waits for the browser to fill it in.
    await context.queryClient
      .ensureQueryData(cataloguePageQuery(EMPTY_FILTERS, 1))
      .catch(() => null);
    return { settings };
  },
  head: ({ loaderData, match }) => {
    const s = loaderData?.settings;
    const ar = match.context.locale === "ar";
    const name = s?.name?.trim();
    const tagline = (ar ? s?.tagline : s?.tagline_fr)?.trim();
    const title = name ? `${name}${tagline ? ` — ${tagline}` : ""}` : "OpenStore DZ";
    const description =
      (ar ? s?.description : s?.description_fr)?.trim() ||
      (ar
        ? "تسوق أونلاين مع الدفع عند الاستلام والتوصيل إلى 69 ولاية."
        : "Shop online, pay cash on delivery.");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { settings } = Route.useLoaderData();
  const catalogue = useCataloguePage(EMPTY_FILTERS, 1);
  const configProblem = supabaseConfigProblem();

  // A shop that has not been connected to a database yet, or whose database is
  // still empty, must see the setup instructions, not an error boundary. This is
  // the first screen a new owner ever loads, so it has to be the most forgiving one.
  if (configProblem || (catalogue.isError && isEmptyDatabaseError(catalogue.error))) {
    return (
      <main className="container-page flex min-h-dvh flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">{settings?.name ?? "OpenStore DZ"}</h1>
        <SetupCheck />
      </main>
    );
  }

  const list = catalogue.data?.products ?? [];

  return (
    <StoreLayout>
      <HomeHero settings={settings} products={list} />
      <CategoryStrip products={list} />
      <FeaturedObjects products={list} />
      <HomeStudioCard settings={settings} products={list} />
    </StoreLayout>
  );
}
