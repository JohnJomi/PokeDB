import type { MetadataRoute } from "next";
import { getIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", ...getIndex().map((e) => `/pokemon/${e.slug}`)].map((path) => ({
    url: new URL(path, SITE_URL).href,
  }));
}
