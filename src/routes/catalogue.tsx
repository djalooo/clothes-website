import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StoreLayout } from "@/components/storefront/store-layout";
import { CatalogueView } from "@/components/storefront/catalogue-view";
import { EMPTY_FILTERS, cataloguePageQuery } from "@/lib/catalogue";
import { translate } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/catalogue")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  loaderDeps: ({ search }) => ({ categorySlug: search.category ?? null }),
  // Prefetched so the server sends products rather than an empty grid.
  loader: async ({ context, deps }) => {
    await context.queryClient
      .ensureQueryData(
        cataloguePageQuery({ ...EMPTY_FILTERS, categorySlug: deps.categorySlug }, 1),
      )
      .catch(() => null);
  },
  head: ({ match }) => ({
    meta: [
      { title: translate(match.context.locale, "nav.products") },
      {
        name: "description",
        content: translate(match.context.locale, "catalogue.description"),
      },
    ],
  }),
  component: CatalogueRoute,
});

/**
 * The catalogue, optionally filtered by category and paged.
 *
 * Category selection stays on this route so buyers can browse the full catalogue
 * without switching to a separate category page.
 */
function CatalogueRoute() {
  const { t } = useI18n();
  const { category } = Route.useSearch();
  const navigate = useNavigate();
  const selectCategory = (categorySlug: string | null) =>
    void navigate({
      to: "/catalogue",
      search: { category: categorySlug ?? undefined },
    });

  return (
    <StoreLayout>
      <div className="container-page catalogue-page py-10">
        <CatalogueView
          heading={t("nav.products")}
          showCategories
          controlledCategorySlug={category ?? null}
          onCategoryChange={selectCategory}
        />
      </div>
    </StoreLayout>
  );
}
