import { Link } from "@tanstack/react-router";
import { ArrowRight, ImageOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import type { CatalogueProduct, StoreSettings } from "@/lib/queries";
import { productImage } from "@/lib/queries";

/**
 * Storefront hero.
 *
 * The hero uses the shop's own banner or first product photo. Shop copy wins
 * over the translated fallback so an owner can keep their own brand message.
 */
export function HomeHero({
  settings,
  products,
}: {
  settings: StoreSettings | null;
  products: CatalogueProduct[];
}) {
  const { t, locale } = useI18n();
  const image = settings?.banner_url || (products[0] ? productImage(products[0]) : null);
  const headline =
    (locale === "ar" ? settings?.tagline : settings?.tagline_fr)?.trim() || t("home.hero.title");

  return (
    <section className="home-hero">
      <div className="container-page home-hero-content">
        {image ? (
          <img className="home-hero-photo" src={image} alt="" fetchPriority="high" />
        ) : (
          <div className="home-hero-photo home-image-placeholder" aria-hidden="true">
            <ImageOff size={32} />
          </div>
        )}

        <div className="home-hero-copy">
          <p className="home-eyebrow">{t("home.eyebrow")}</p>
          <h1>{headline}</h1>
          <p className="home-hero-description">{t("home.hero.body")}</p>
          <Link to="/catalogue" className="home-primary-button">
            {t("home.hero.cta")}
            <ArrowRight size={18} className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
