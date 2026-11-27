import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useCategories, type CatalogueProduct } from "@/lib/queries";
import { productImage } from "@/lib/queries";
import { localized } from "@/lib/i18n";

export function CategoryStrip({ products }: { products: CatalogueProduct[] }) {
  const { t, locale } = useI18n();
  const { data: categories } = useCategories();
  const visible = (categories ?? []).filter((category) => category.product_count > 0).slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <section className="container-page home-category-section">
      <h2 className="home-section-title">{t("home.categories")}</h2>
      <div className="home-category-grid">
        {visible.map((category) => {
          const representative = products.find(
            (product) => product.categories?.slug === category.slug,
          );
          const image =
            category.image_url ?? (representative ? productImage(representative) : null);

          return (
            <Link
              key={category.id}
              to="/catalogue"
              search={{ category: category.slug }}
              className="home-category-tile"
            >
              <span className="home-category-image">
                {image ? (
                  <img src={image} alt="" loading="lazy" className="home-category-photo" />
                ) : (
                  <span className="home-image-placeholder" aria-hidden="true">
                    <ImageOff size={24} />
                  </span>
                )}
              </span>
              <span className="home-category-name">
                {localized(locale, category.name, category.name_fr)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
