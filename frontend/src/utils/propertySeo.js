const FALLBACK_SITE_URL = "https://karabook.in";

export function slugifyPropertyName(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildPropertySlug(property) {
  if (!property?._id) return "";

  const nameSlug = slugifyPropertyName(property.propertyName || "property");
  return `${nameSlug}-${property._id}`;
}

export function getPropertyPath(property, search = "") {
  const slug = buildPropertySlug(property);
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `/properties/${slug}${query}`;
}

export function extractPropertyId(routeParam = "") {
  const value = String(routeParam).trim();
  if (!value) return "";

  const parts = value.split("-");
  const lastPart = parts[parts.length - 1];
  return lastPart || value;
}

export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL;
}

export function getPropertyAbsoluteUrl(property) {
  return `${getSiteUrl()}${getPropertyPath(property)}`;
}

export function buildPropertyMetaDescription(property) {
  if (!property) return "Discover handpicked villas and stays on Karabook.";

  const parts = [
    property.propertyName,
    property.city,
    property.state,
    property.propertyType,
    property.maxGuests ? `for up to ${property.maxGuests} guests` : "",
  ].filter(Boolean);

  const summary = parts.join(", ");
  const description = property.description?.trim();

  if (!description) {
    return `${summary}. Book direct on Karabook.`;
  }

  const trimmedDescription =
    description.length > 140 ? `${description.slice(0, 137).trim()}...` : description;

  return `${summary}. ${trimmedDescription}`;
}

