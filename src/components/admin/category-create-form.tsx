import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n-context";
import { isValidCategoryImageUrl } from "@/lib/admin-categories";
import type { createCategoryWithImage } from "@/lib/admin-categories";
import { CategoryImagePicker } from "./category-image-picker";

type CreateInput = Parameters<typeof createCategoryWithImage>[0];

export function CategoryCreateForm({
  sortOrder,
  busy,
  creating,
  onCreate,
}: {
  sortOrder: number;
  busy: boolean;
  creating: boolean;
  onCreate: (input: CreateInput) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const imageUrlValid = !imageUrl.trim() || isValidCategoryImageUrl(imageUrl.trim());

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (!imageUrlValid) return;
        onCreate({
          name: name.trim(),
          name_fr: nameFr.trim() || null,
          sort_order: sortOrder,
          image,
          image_url: imageUrl.trim() || null,
        });
      }}
    >
      <Field label={t("admin.categories.name")} required>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          dir="rtl"
          required
          minLength={2}
        />
      </Field>
      <Field label={t("admin.categories.nameLatin")} hint={t("admin.categories.nameLatinHint")}>
        <Input value={nameFr} onChange={(event) => setNameFr(event.target.value)} dir="ltr" />
      </Field>
      <div className="sm:col-span-2">
        <CategoryImagePicker
          file={image}
          imageUrl={imageUrl}
          disabled={busy}
          onChange={setImage}
          onImageUrlChange={setImageUrl}
        />
      </div>
      <Button type="submit" disabled={busy || name.trim().length < 2 || !imageUrlValid}>
        <Plus size={16} aria-hidden="true" />
        {creating ? t("admin.images.uploading") : t("admin.categories.add")}
      </Button>
    </form>
  );
}
