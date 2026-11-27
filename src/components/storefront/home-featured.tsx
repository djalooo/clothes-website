import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import type { CatalogueProduct } from "@/lib/queries";
import { NoProducts } from "@/components/ui/feedback";
import { ProductGrid } from "./product-card";

export function FeaturedObjects({ products }: { products: CatalogueProduct[] }) {
  const { t } = useI18n();

  return (
    <section id="featured" className="container-page home-featured">
      <div className="home-section-heading">
        <h2 className="home-section-title">{t("home.featured")}</h2>
        <Link to="/catalogue" className="home-view-all">
          {t("home.viewAll")}
        </Link>
      </div>

      {products.length === 0 ? (
        <NoProducts />
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
