export function getPublicationRoute(slug: string, prefix = "") {
  return `${prefix}/publications/${slug}`;
}

export function getPublicationPageRoute(
  slug: string,
  pageId: string,
  prefix = "",
) {
  return `${getPublicationRoute(slug, prefix)}/sections/${pageId}`;
}

export function parseFieldGuideRoute(pathname: string) {
  const pageMatch = pathname.match(
    /^\/publications\/([^/]+)\/sections\/([^/]+)\/?$/,
  );
  const publicationMatch = pathname.match(/^\/publications\/([^/]+)\/?$/);

  return {
    slug: pageMatch?.[1] || publicationMatch?.[1] || null,
    pageId: pageMatch?.[2] || null,
    isReading: Boolean(pageMatch?.[1] || publicationMatch?.[1]),
  };
}
