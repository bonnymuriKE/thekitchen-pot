// Navigation structure: top-level items can be a plain link ({ href, text })
// or a dropdown group ({ text, children: [{ href, text }] })
export const navigationLinks = Object.freeze([
  {
    text: "Small-Space Kitchens",
    children: [
      { href: "/blog/tag/storage-organization/", text: "Storage & Organization" },
      { href: "/blog/tag/cooking-for-one/", text: "Cooking for One" },
      { href: "/blog/tag/eco-friendly-appliances/", text: "Eco-Friendly Appliances" },
      { href: "/blog/tag/small-space-bakeware/", text: "Small-Space Bakeware" },
      { href: "/blog/tag/balcony-patio-grilling/", text: "Balcony & Patio Grilling" },
    ],
  },
  {
    text: "Kitchen Appliances",
    children: [
      { href: "/blog/category/small-appliances/", text: "Small Appliances" },
      { href: "/blog/category/beverages-equipment/", text: "Coffee & Beverage Makers" },
      { href: "/blog/category/blenders-and-juicing-equipment/", text: "Blenders & Juicers" },
      { href: "/blog/category/range-hoods/", text: "Range Hoods" },
      { href: "/blog/category/kitchenware/", text: "Kitchen Tools & Gadgets" },
    ],
  },
  {
    text: "Cookware",
    children: [
      { href: "/blog/category/cookware-equipment/", text: "Cookware Sets & Reviews" },
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
