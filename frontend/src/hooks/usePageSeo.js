import { useEffect } from 'react';

const SITE_URL = 'https://jmiquiz.live';

const ensureMetaTag = (name) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  return tag;
};

const ensureCanonicalTag = () => {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  return tag;
};

const upsertJsonLdScript = (id, jsonData) => {
  let scriptTag = document.getElementById(id);
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = id;
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(jsonData);
};

const usePageSeo = ({ title, description, path, breadcrumbs = [] }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      const descriptionTag = ensureMetaTag('description');
      descriptionTag.setAttribute('content', description);
    }

    if (path) {
      const canonicalTag = ensureCanonicalTag();
      canonicalTag.setAttribute('href', `${SITE_URL}${path}`);
    }

    if (breadcrumbs.length > 0) {
      const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      };

      upsertJsonLdScript('page-breadcrumb-jsonld', breadcrumbJsonLd);
    }
  }, [title, description, path, breadcrumbs]);
};

export default usePageSeo;