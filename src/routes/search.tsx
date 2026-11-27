import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { StoreLayout } from "@/components/storefront/store-layout";
import { CatalogueView } from "@/components/storefront/catalogue-view";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { translate } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import { EMPTY_FILTERS, cataloguePageQuery } from "@/lib/catalogue";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: async ({ context, deps }) => {
    if (!deps.q.trim()) return;
    // Prefetched so a shared search link renders its results server-side.
    await context.queryClient
      .ensureQueryData(cataloguePageQuery({ ...EMPTY_FILTERS, query: deps.q }, 1))
      .catch(() => null);
  },
  head: ({ match }) => ({
    meta: [
      { title: translate(match.context.locale, "search.title") },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

/**
 * Search page.
 *
 * The query lives in the URL rather than in component state, so a search result
 * can be shared, bookmarked, and survives a back navigation. Filtering is then
 * handled by the shared CatalogueView, which means search and a category page
 * cannot diverge.
 */
function SearchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const router = useRouter();
  const { q } = Route.useSearch();
  const [draft, setDraft] = useState(q ?? "");
  const [showCancelButton, setShowCancelButton] = useState(() => !(q ?? "").trim());
  const searchFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(q ?? ""), [q]);

  const query = (q ?? "").trim();
  const hasQuery = query.length > 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowCancelButton(false);
    void navigate({ to: "/search", search: { q: draft.trim() || undefined } });
  };

  const clearSearch = () => {
    setDraft("");
    setShowCancelButton(true);
    searchFieldRef.current?.querySelector("input")?.focus();
    void navigate({ to: "/search", search: { q: undefined } });
  };

  const cancelSearch = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    void navigate({ to: "/catalogue" });
  };

  return (
    <StoreLayout showFooter={false}>
      <div className="container-page py-10">
        {showCancelButton && (
          <div className="mb-3 flex justify-end" dir="ltr">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={cancelSearch}
              aria-label={t("common.cancel")}
              title={t("common.cancel")}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
        )}
        <form onSubmit={submit} className="search-form mb-8 flex flex-wrap items-end gap-3">
          <Field label={t("search.title")} className="search-form-field min-w-0 flex-1 sm:min-w-64">
            <div ref={searchFieldRef} className="search-input-control">
              <Input
                type="search"
                className="search-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("search.placeholder")}
                autoFocus
                maxLength={100}
              />
              {draft.length > 0 && (
                <button
                  type="button"
                  className="search-clear-button"
                  onClick={clearSearch}
                  aria-label={t("search.clear")}
                  title={t("search.clear")}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </Field>
          <Button
            type="submit"
            className="search-submit-button mb-0.5"
            aria-label={t("nav.search")}
          >
            <SearchIcon size={16} aria-hidden="true" />
            <span className="search-submit-label">{t("nav.search")}</span>
          </Button>
        </form>

        {hasQuery && (
          <CatalogueView
            heading={`${t("search.for")} "${query}"`}
            initialFilters={{ ...EMPTY_FILTERS, query }}
          />
        )}

        {!hasQuery && (
          <p className="py-16 text-center text-sm text-on-surface-muted">
            {t("search.placeholder")}
          </p>
        )}
      </div>
    </StoreLayout>
  );
}
