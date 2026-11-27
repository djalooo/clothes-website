import { useI18n } from "@/lib/i18n-context";
import { localized } from "@/lib/i18n";
import { useCategories } from "@/lib/queries";

export function CatalogueCategoryControl({
  categorySlug,
  onSelect,
}: {
  categorySlug: string | null;
  onSelect: (categorySlug: string | null) => void;
}) {
  const { t, locale } = useI18n();
  const { data: categories } = useCategories();
  const visible = (categories ?? []).filter((category) => category.product_count > 0);

  if (visible.length === 0) return null;

  return (
    <div className="catalogue-category-control" role="group" aria-label={t("home.categories")}>
      <button
        type="button"
        className="catalogue-category-segment"
        aria-pressed={categorySlug === null}
        onClick={() => onSelect(null)}
      >
        {t("catalogue.all")}
      </button>
      {visible.map((category) => (
        <button
          key={category.id}
          type="button"
          className="catalogue-category-segment"
          aria-pressed={categorySlug === category.slug}
          onClick={() => onSelect(category.slug)}
        >
          {localized(locale, category.name, category.name_fr)}
        </button>
      ))}
    </div>
  );
}
