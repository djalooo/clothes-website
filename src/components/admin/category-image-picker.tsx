import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { isValidCategoryImageUrl } from "@/lib/admin-categories";
import { useI18n } from "@/lib/i18n-context";

export function CategoryImagePicker({
  file,
  imageUrl,
  disabled,
  onChange,
  onImageUrlChange,
}: {
  file: File | null;
  imageUrl: string;
  disabled: boolean;
  onChange: (file: File | null) => void;
  onImageUrlChange: (imageUrl: string) => void;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const selectFile = (selected: File | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = selected ? URL.createObjectURL(selected) : null;
    setPreviewUrl(previewRef.current);
    onChange(selected);
    if (selected) onImageUrlChange("");
  };

  const imageUrlInvalid = Boolean(imageUrl.trim()) && !isValidCategoryImageUrl(imageUrl.trim());

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{t("admin.categories.image")}</span>
      <div className="flex flex-wrap items-end gap-3">
        {file && previewUrl && (
          <img
            src={previewUrl}
            alt=""
            className="size-16 rounded-full border border-outline object-cover"
          />
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={t("admin.categories.image")}
          disabled={disabled}
          onChange={(event) => {
            selectFile(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          <ImagePlus size={15} aria-hidden="true" />
          {t("admin.images.add")}
        </Button>
        <Field
          label={t("admin.images.pasteUrl")}
          hint={imageUrlInvalid ? t("admin.categories.imageUrlInvalid") : undefined}
          className="min-w-56 flex-1"
        >
          <Input
            value={imageUrl}
            onChange={(event) => {
              const value = event.target.value;
              if (value.trim() && file) selectFile(null);
              onImageUrlChange(value);
            }}
            dir="ltr"
            type="url"
            placeholder="https://…"
            disabled={disabled}
          />
        </Field>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => {
              selectFile(null);
              if (input.current) input.current.value = "";
            }}
          >
            <X size={15} aria-hidden="true" />
            {t("common.delete")}
          </Button>
        )}
      </div>
      <p className="text-xs text-on-surface-muted">{t("admin.categories.imageHint")}</p>
    </div>
  );
}
