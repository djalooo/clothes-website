import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { SelectDropdown } from "@/components/select-dropdown";
import { useI18n } from "@/lib/i18n-context";
import { formatDzd } from "@/lib/format";
import { activeFilterCount, type CatalogueFilters, type SortKey } from "@/lib/catalogue";
import { cn } from "@/lib/utils";
import { CatalogueCategoryControl } from "./catalogue-category-control";
import { FilterGroup } from "./catalogue-filter-group";

type Facets = {
  sizes: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};

/**
 * Catalogue category, filter, and sort controls.
 *
 * Facet controls stay collapsed behind the button at every breakpoint so the
 * product grid retains its space. The count badge shows when filters are active.
 */
export function CatalogueToolbar({
  filters,
  onChange,
  sizes,
  colors,
  priceMin,
  priceMax,
  resultCount,
  showCategories = false,
}: {
  filters: CatalogueFilters;
  onChange: (next: CatalogueFilters) => void;
  resultCount: number;
  showCategories?: boolean;
} & Facets) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  return (
    <div className="catalogue-toolbar-content flex flex-col gap-3">
      {showCategories && (
        <CatalogueCategoryControl
          categorySlug={filters.categorySlug}
          onSelect={(categorySlug) => onChange({ ...filters, categorySlug })}
        />
      )}

      <div className="catalogue-toolbar-actions">
        <Button
          variant="secondary"
          size="sm"
          className="catalogue-filter-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {t("catalogue.filters")}
          {active > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-on-primary">
              {active}
            </span>
          )}
        </Button>

        <span className="sr-only" role="status" aria-live="polite">
          {resultCount} {t("catalogue.results")}
        </span>

        <span className="catalogue-sort">
          <label htmlFor="catalogue-sort" className="sr-only">
            {t("catalogue.sort")}
          </label>
          <SelectDropdown<SortKey>
            id="catalogue-sort"
            ariaLabel={t("catalogue.sort")}
            value={filters.sort}
            onValueChange={(sort) => onChange({ ...filters, sort })}
            className="catalogue-sort-select"
            options={[
              { value: "newest", label: t("catalogue.sortNewest") },
              { value: "price-asc", label: t("catalogue.sortPriceAsc") },
              { value: "price-desc", label: t("catalogue.sortPriceDesc") },
              { value: "name", label: t("catalogue.sortName") },
            ]}
          />
        </span>
      </div>

      {open && (
        <FilterPanel
          filters={filters}
          onChange={onChange}
          sizes={sizes}
          colors={colors}
          priceMin={priceMin}
          priceMax={priceMax}
        />
      )}
    </div>
  );
}

function FilterPanel({
  filters,
  onChange,
  sizes,
  colors,
  priceMin,
  priceMax,
}: {
  filters: CatalogueFilters;
  onChange: (next: CatalogueFilters) => void;
} & Facets) {
  const { t } = useI18n();

  const set = <K extends keyof CatalogueFilters>(key: K, value: CatalogueFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const clear = () =>
    onChange({
      ...filters,
      sizes: [],
      colors: [],
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
    });

  const toggleIn = (key: "sizes" | "colors", value: string) => {
    const current = filters[key];
    set(key, current.includes(value) ? current.filter((e) => e !== value) : [...current, value]);
  };

  return (
    <div className="catalogue-filter-panel">
      <button type="button" onClick={clear} className="catalogue-clear-all">
        {t("catalogue.clearAll")}
      </button>

      {sizes.length > 0 && (
        <FilterGroup
          label={t("catalogue.size")}
          values={sizes}
          selected={filters.sizes}
          allLabel={t("catalogue.all")}
          onClear={() => set("sizes", [])}
          onToggle={(value) => toggleIn("sizes", value)}
        />
      )}

      {colors.length > 0 && (
        <FilterGroup
          label={t("catalogue.color")}
          values={colors}
          selected={filters.colors}
          allLabel={t("catalogue.all")}
          onClear={() => set("colors", [])}
          onToggle={(value) => toggleIn("colors", value)}
        />
      )}

      <div className="catalogue-price-filters">
        <span className="text-xs font-semibold uppercase tracking-[0.03em] text-on-surface-muted">
          {t("catalogue.price")}
        </span>
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            className={cn(
              "chip",
              filters.minPrice === null && filters.maxPrice === null && "filled",
            )}
            aria-pressed={filters.minPrice === null && filters.maxPrice === null}
            onClick={() => onChange({ ...filters, minPrice: null, maxPrice: null })}
          >
            {t("catalogue.all")}
          </button>
          <Field label={t("catalogue.priceFrom")} className="w-32">
            <Input
              type="number"
              inputMode="numeric"
              dir="ltr"
              className="font-mono"
              placeholder={String(priceMin)}
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                set("minPrice", event.target.value === "" ? null : Number(event.target.value))
              }
            />
          </Field>
          <Field label={t("catalogue.priceTo")} className="w-32">
            <Input
              type="number"
              inputMode="numeric"
              dir="ltr"
              className="font-mono"
              placeholder={String(priceMax)}
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                set("maxPrice", event.target.value === "" ? null : Number(event.target.value))
              }
            />
          </Field>
          <p className="pb-2 font-mono text-xs text-on-surface-muted" dir="ltr">
            {formatDzd(priceMin)} - {formatDzd(priceMax)}
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[color:var(--primary-solid)]"
          checked={filters.inStockOnly}
          onChange={(event) => set("inStockOnly", event.target.checked)}
        />
        {t("catalogue.inStockOnly")}
      </label>
    </div>
  );
}
