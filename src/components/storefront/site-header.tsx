import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, Store, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n-context";
import { useStoreSettings } from "@/lib/queries";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

type HeaderLink = { to: "/" | "/catalogue" | "/track"; label: string };

/**
 * Storefront header.
 *
 * The cart count is an aria-live region so a screen-reader user hears the basket
 * change when they add something, which is otherwise a silent state change.
 */
export function SiteHeader() {
  const { t } = useI18n();
  const { count, openCart } = useCart();
  const { data: settings } = useStoreSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const storeName = settings?.name?.trim() || t("app.tagline");

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/catalogue", label: t("nav.shop") },
    { to: "/track", label: t("nav.trackOrder") },
  ] as const;

  return (
    <header className="editorial-header sticky top-0 z-30 border-b border-outline bg-nav-bg/95 backdrop-blur supports-[backdrop-filter]:bg-nav-bg/80">
      <div className="editorial-header-inner container-page flex h-16 items-center gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="editorial-header-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("common.close") : t("nav.shop")}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <Link
          to="/"
          className="editorial-wordmark flex min-h-11 min-w-0 items-center gap-2 font-display text-lg font-semibold"
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt=""
              className="h-9 max-w-[120px] shrink-0 object-contain"
            />
          ) : (
            <Store size={20} className="shrink-0 text-primary" aria-hidden="true" />
          )}
          <span className="truncate">{storeName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-3 py-2 text-sm text-on-surface-muted transition-colors hover:bg-surface-mid hover:text-on-surface"
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-on-surface font-medium" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="editorial-header-tools ms-auto flex items-center gap-2">
          <Link to="/search" className="editorial-header-icon" aria-label={t("nav.search")}>
            <Search size={19} aria-hidden="true" />
          </Link>
          <LocaleSwitcher className="hidden sm:block" />
          <ThemeToggle className="desktop-theme-toggle" />

          <button
            type="button"
            onClick={openCart}
            data-testid="cart-open"
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-outline text-on-surface transition-colors hover:bg-surface-mid"
            aria-label={t("cart.title")}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="sr-only" aria-live="polite">
              {count > 0 ? t("cart.itemMany", { count }) : ""}
            </span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-primary font-mono text-[0.65rem] font-semibold text-on-primary"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileNavigation links={links} menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileNavigation({
  links,
  menuOpen,
  onClose,
}: {
  links: readonly HeaderLink[];
  menuOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border-t border-outline transition-[max-height] duration-300 ease-out-soft md:hidden",
        menuOpen ? "max-h-72" : "max-h-0",
      )}
    >
      <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className="rounded-[10px] px-3 py-2.5 text-sm hover:bg-surface-mid"
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle
          className="mobile-menu-theme-toggle mt-2 sm:hidden"
          showLabel
        />
        <LocaleSwitcher className="mt-2 sm:hidden" />
      </nav>
    </div>
  );
}
