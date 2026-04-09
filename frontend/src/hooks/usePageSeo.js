import { useEffect } from 'react';

const SITE_URL = 'https://jmiquiz.live';

const ensureMetaTag = (attr, value) => {
  let tag = document.querySelector(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
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
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      const descriptionTag = ensureMetaTag('name', 'description');
      descriptionTag.setAttribute('content', description);
    }

    // Update canonical URL
    if (path) {
      const canonicalTag = ensureCanonicalTag();
      canonicalTag.setAttribute('href', `${SITE_URL}${path}`);
    }

    // Update Open Graph tags
    if (title) {
      const ogTitle = ensureMetaTag('property', 'og:title');
      ogTitle.setAttribute('content', title);

      const twitterTitle = ensureMetaTag('name', 'twitter:title');
      twitterTitle.setAttribute('content', title);
    }

    if (description) {
      const ogDesc = ensureMetaTag('property', 'og:description');
      ogDesc.setAttribute('content', description);

      const twitterDesc = ensureMetaTag('name', 'twitter:description');
      twitterDesc.setAttribute('content', description);
    }

    if (path) {
      const ogUrl = ensureMetaTag('property', 'og:url');
      ogUrl.setAttribute('content', `${SITE_URL}${path}`);
    }

    // Update breadcrumb structured data
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