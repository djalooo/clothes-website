import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";
import { uploadProductImage } from "@/lib/image";
import { cn } from "@/lib/utils";

type BrandImageKind = "logo" | "darkLogo" | "favicon";
type BrandImageFieldProps = {
  kind: BrandImageKind;
  value: string | null;
  onChange: (url: string | null) => void;
};

function BrandImageField({
  kind,
  value,
  onChange,
}: BrandImageFieldProps) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isFavicon = kind === "favicon";
  const label =
    kind === "logo"
      ? t("admin.brand.logo")
      : kind === "darkLogo"
        ? t("admin.brand.logoDark")
        : t("admin.brand.favicon");
  const hint =
    kind === "logo"
      ? t("admin.brand.logoHint")
      : kind === "darkLogo"
        ? t("admin.brand.logoDarkHint")
        : t("admin.brand.faviconHint");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { url, error } = await uploadProductImage(
        file,
        "brand",
        isFavicon ? { aspect: 1, focus: 0.5 } : undefined,
      );
      if (error || !url) toast.error(error ?? t("common.somethingWrong"));
      else onChange(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.somethingWrong"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.03em] text-on-surface-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "grid h-14 place-items-center overflow-hidden rounded-[10px] border border-dashed border-outline-hi bg-surface-mid",
            isFavicon ? "w-14" : "w-28",
            kind === "darkLogo" && "bg-neutral-900",
          )}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className={cn(
                "object-contain",
                isFavicon ? "max-h-10 max-w-10" : "max-h-12 max-w-24",
              )}
            />
          ) : (
            <ImagePlus size={20} className="text-on-surface-muted" aria-hidden="true" />
          )}
        </span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus size={15} aria-hidden="true" />
          )}
          {kind === "favicon"
            ? value
              ? t("admin.brand.replaceFavicon")
              : t("admin.brand.uploadFavicon")
            : value
              ? t("admin.brand.replace")
              : t("admin.brand.upload")}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X size={15} aria-hidden="true" />
            {t("common.delete")}
          </Button>
        )}
      </div>
      <p className="text-xs text-on-surface-muted">{hint}</p>
    </div>
  );
}

export function LogoField(props: Omit<BrandImageFieldProps, "kind">) {
  return <BrandImageField kind="logo" {...props} />;
}

export function DarkLogoField(props: Omit<BrandImageFieldProps, "kind">) {
  return <BrandImageField kind="darkLogo" {...props} />;
}

export function FaviconField(props: Omit<BrandImageFieldProps, "kind">) {
  return <BrandImageField kind="favicon" {...props} />;
}

// Colours that read well as buttons on both light and dark backgrounds.
const PRESETS = ["#c2410c", "#be123c", "#7c3aed", "#1d4ed8", "#0f766e", "#15803d", "#111111"];

export function ColorField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (color: string | null) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.03em] text-on-surface-muted">
        {t("admin.brand.color")}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            className={cn("swatch", value === color && "active")}
          >
            <span style={{ background: color }} />
          </button>
        ))}
        <input
          type="color"
          value={value ?? "#c2410c"}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t("admin.brand.custom")}
          className="size-9 cursor-pointer rounded-full border border-outline bg-transparent"
        />
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            {t("admin.brand.default")}
          </Button>
        )}
      </div>
    </div>
  );
}
