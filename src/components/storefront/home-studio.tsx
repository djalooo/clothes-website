import { ImageOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { productImage, type CatalogueProduct, type StoreSettings } from "@/lib/queries";

export function HomeStudioCard({
  settings,
  products,
}: {
  settings: StoreSettings | null;
  products: CatalogueProduct[];
}) {
  const { t, locale } = useI18n();
  const image = products[1]
    ? productImage(products[1])
    : products[0]
      ? productImage(products[0])
      : null;
  const description =
    (locale === "ar" ? settings?.description : settings?.description_fr)?.trim() ||
    t("home.studio.body");

  return (
    <section className="container-page home-studio-section">
      <div className="home-studio-card">
        {image ? (
          <img src={image} alt="" loading="lazy" className="home-studio-photo" />
        ) : (
          <div className="home-studio-photo home-image-placeholder" aria-hidden="true">
            <ImageOff size={32} />
          </div>
        )}
        <div className="home-studio-copy">
          <p className="home-eyebrow">{t("home.studio.eyebrow")}</p>
          <h2>{t("home.studio.title")}</h2>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
}
