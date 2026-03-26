import { useEffect } from "react";

const META_NAMES = ["description", "robots"];
const META_PROPERTIES = ["og:title", "og:description", "og:type", "og:url", "og:image"];

function upsertMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function SeoMeta({
  title,
  description,
  canonical,
  image,
  robots = "index,follow",
  jsonLd,
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonical);
    if (image) {
      upsertMeta("property", "og:image", image);
    }

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    const hadCanonical = Boolean(canonicalLink);
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical);

    let schemaTag = null;
    if (jsonLd) {
      schemaTag = document.createElement("script");
      schemaTag.type = "application/ld+json";
      schemaTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(schemaTag);
    }

    return () => {
      document.title = previousTitle;
      META_NAMES.forEach((name) => {
        const tag = document.head.querySelector(`meta[name="${name}"]`);
        if (tag) tag.remove();
      });
      META_PROPERTIES.forEach((property) => {
        const tag = document.head.querySelector(`meta[property="${property}"]`);
        if (tag) tag.remove();
      });
      if (!hadCanonical && canonicalLink) {
        canonicalLink.remove();
      }
      if (schemaTag) {
        schemaTag.remove();
      }
    };
  }, [canonical, description, image, jsonLd, robots, title]);

  return null;
}

