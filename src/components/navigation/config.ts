// Navigation structure: top-level items can be a plain link ({ href, text })
// or a dropdown group ({ text, children: [{ href, text }] })
export const navigationLinks = Object.freeze([
  {
    href: "/blog/tag/small-space-kitchens/",
    text: "Small-Space Kitchens",
  },
  {
    text: "Kitchen Appliances",
    children: [
      { href: "/blog/category/beverages-equipment/", text: "Coffee & Beverage Makers" },
      { href: "/blog/category/blenders-and-juicing-equipment/", text: "Blenders & Juicers" },
      { href: "/blog/category/range-hoods/", text: "Range Hoods" },
      { href: "/blog/category/kitchenware/", text: "Kitchen Tools & Gadgets" },
    ],
  },
  {
    text: "Cookware",
    children: [
      { href: "/blog/category/pans-and-pots/", text: "Pots & Pans" },
      { href: "/blog/category/bakeware/", text: "Bakeware" },
      { href: "/blog/category/gas-and-charcoal-grills/", text: "Grills & Outdoor Cooking" },
    ],
  },
  {
    href: "/blog/category/how-to-guides/",
    text: "How-To Guides",
  },
  {
    text: "About",
    children: [
      { href: "/about/", text: "About Us" },
      { href: "/contact-us/", text: "Contact" },
      { href: "/privacy-policy/", text: "Privacy Policy" },
    ],
  },
]);
