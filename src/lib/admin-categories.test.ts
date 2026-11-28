import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteProductImage, from, insert, uploadCategoryImage } = vi.hoisted(() => ({
  deleteProductImage: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  uploadCategoryImage: vi.fn(),
}));

vi.mock("./image", () => ({ deleteProductImage, uploadCategoryImage }));
vi.mock("./supabase/client", () => ({ getSupabase: () => ({ from }) }));

import { createCategoryWithImage } from "./admin-categories";

const input = {
  name: "تصنيف",
  name_fr: "Category",
  sort_order: 2,
  image_url: null,
};

describe("createCategoryWithImage", () => {
  beforeEach(() => {
    from.mockReturnValue({ insert });
    insert.mockResolvedValue({ error: null });
    uploadCategoryImage.mockReset();
    deleteProductImage.mockReset();
  });

  it("saves the uploaded image URL with the category", async () => {
    const file = new File(["photo"], "category.png", { type: "image/png" });
    uploadCategoryImage.mockResolvedValue({
      url: "https://shop.example/storage/categories/category/photo.webp",
      error: null,
    });

    await createCategoryWithImage({ ...input, image: file });

    expect(uploadCategoryImage).toHaveBeenCalledWith(file, expect.any(String));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: input.name,
        image_url: expect.stringContaining("/photo.webp"),
      }),
    );
  });

  it("does not create the category when its image upload fails", async () => {
    const file = new File(["photo"], "category.png", { type: "image/png" });
    uploadCategoryImage.mockResolvedValue({ url: null, error: "Upload failed" });

    await expect(createCategoryWithImage({ ...input, image: file })).rejects.toThrow(
      "Upload failed",
    );
    expect(insert).not.toHaveBeenCalled();
  });

  it("creates a category without an image when none was selected", async () => {
    await createCategoryWithImage({ ...input, image: null });

    expect(uploadCategoryImage).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ image_url: null }));
  });

  it("saves a direct HTTPS image URL without uploading a file", async () => {
    const url = "https://images.example/category.webp";

    await createCategoryWithImage({ ...input, image: null, image_url: url });

    expect(uploadCategoryImage).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ image_url: url }));
  });

  it.each([
    "http://images.example/category.webp",
    "javascript:alert(1)",
    "https://user:pass@images.example/category.webp",
    "not a URL",
  ])("rejects an unsafe or invalid image URL: %s", async (image_url) => {
    await expect(createCategoryWithImage({ ...input, image: null, image_url })).rejects.toThrow(
      "valid HTTPS image URL",
    );
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects providing both an uploaded image and an image URL", async () => {
    const file = new File(["photo"], "category.png", { type: "image/png" });

    await expect(
      createCategoryWithImage({
        ...input,
        image: file,
        image_url: "https://images.example/category.webp",
      }),
    ).rejects.toThrow("Choose either an image file or an image URL");
    expect(uploadCategoryImage).not.toHaveBeenCalled();
  });

  it("does not delete an external image URL when category creation fails", async () => {
    const url = "https://images.example/category.webp";
    insert.mockResolvedValue({ error: { code: "42501", message: "Not allowed" } });

    await expect(
      createCategoryWithImage({ ...input, image: null, image_url: url }),
    ).rejects.toThrow("Not allowed");
    expect(deleteProductImage).not.toHaveBeenCalled();
  });

  it("removes the uploaded image when category creation fails", async () => {
    const file = new File(["photo"], "category.png", { type: "image/png" });
    const url = "https://shop.example/storage/categories/category/photo.webp";
    uploadCategoryImage.mockResolvedValue({ url, error: null });
    insert.mockResolvedValue({ error: { code: "42501", message: "Not allowed" } });

    await expect(createCategoryWithImage({ ...input, image: file })).rejects.toThrow("Not allowed");
    expect(deleteProductImage).toHaveBeenCalledWith(url);
  });
});
