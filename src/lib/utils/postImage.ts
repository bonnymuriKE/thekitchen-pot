import { generateSlug } from "./slugify";

/**
 * Fallback cover image to use for a post when it has no image of its own.
 * Uses a category-specific branded cover (so listing pages don't show the
 * exact same placeholder graphic on every single card), falling back to a
 * generic branded cover for categories we don't have a specific graphic for.
 */
export function getCoverImage(image?: string | null, category?: string | null): string {
  if (image) return image;

  if (category) {
    const slug = generateSlug(category);
    const known = [
      "how-to-guides",
      "cookware-equipment",
      "small-appliances",
      "pans-and-pots",
      "bakeware",
      "kitchenware",
      "gas-and-charcoal-grills",
      "beverages-equipment",
      "blenders-and-juicing-equipment",
      "range-hoods",
    ];
    if (known.includes(slug)) {
      return `/images/blog/covers/${slug}.jpg`;
    }
  }

  return "/images/blog/default-cover.jpg";
}
