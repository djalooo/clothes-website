import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatDzd } from "@/lib/format";
import {
  priceRange,
  sortVariants,
  productImage,
  totalStock,
  type CatalogueProduct,
} from "@/lib/queries";
import { localized } from "@/lib/i18n";
import { saleOf } from "@/lib/sale";

/**
 * Shared storefront product card.
 *
 * The homepage presentation is the shared reference: square media, compact title
 * and price. The whole card links to the product, so it needs no nested CTA.
 */
function ProductCard({ product }: { product: CatalogueProduct }) {
  const { t, locale } = useI18n();

  const image = productImage(product);
  const range = priceRange(product);
  // The cheapest variant sets the headline price, so its sale is the one shown.
  const cheapest = sortVariants(product.product_variants).find((v) => v.price === range?.min);
  const sale = cheapest ? saleOf(cheapest) : null;
  const stock = totalStock(product);
  const soldOut = stock <= 0;

  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="product-card">
      <div className="pc-media">
        {image ? (
          <img src={image} alt="" loading="lazy" decoding="async" />
        ) : (
          <ImageOff size={44} aria-hidden="true" />
        )}
        {soldOut ? <span className="pc-flag out">{t("store.outOfStock")}</span> : null}
      </div>

      <div className="pc-body">
        <h3 className="pc-title">{localized(locale, product.name, product.name_fr)}</h3>

        {range && (
          <span className="pc-price-row">
            <span className="pc-price" dir="ltr">
              {range.min === range.max
                ? formatDzd(range.min, locale)
                : `${t("store.from")} ${formatDzd(range.min, locale)}`}
            </span>
            {sale && (
              <>
                <span className="pc-price-old" dir="ltr">
                  {formatDzd(sale.was, locale)}
                </span>
                <span className="pc-price-save" dir="ltr">
                  −{sale.percent}%
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: CatalogueProduct[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
