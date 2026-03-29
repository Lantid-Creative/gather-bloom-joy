import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
}

/**
 * Sets document <head> meta tags for SEO.
 * Because Vite is an SPA, we mutate <head> at runtime.
 * For full SSR/pre-rendering, pair with a prerender plugin.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = "/og-image.jpg",
  ogType = "website",
  jsonLd,
  noIndex = false,
}: SEOHeadProps) => {
  const siteName = "Qantid";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Discover & Book Events Across Africa`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to upsert a <meta> tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    if (description) setMeta("name", "description", description);
    if (noIndex) setMeta("name", "robots", "noindex,nofollow");

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    if (description) setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", siteName);
    if (ogImage) setMeta("property", "og:image", ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    if (description) setMeta("name", "twitter:description", description);
    if (ogImage) setMeta("name", "twitter:image", ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const canonicalUrl = canonical || window.location.origin + window.location.pathname;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);

    // JSON-LD
    const existingLd = document.querySelector('script[data-seo-jsonld]');
    if (existingLd) existingLd.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup JSON-LD on unmount
      const ld = document.querySelector('script[data-seo-jsonld]');
      if (ld) ld.remove();
    };
  }, [fullTitle, description, canonical, ogImage, ogType, jsonLd, noIndex]);

  return null;
};

export default SEOHead;
