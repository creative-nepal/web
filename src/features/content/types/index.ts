export type ContentLocale = "en" | "ne";

export interface HeroBlock {
  id: string;
  type: "hero";
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
}

export interface FeaturesBlock {
  id: string;
  type: "features";
  heading?: string;
  subheading?: string;
  items: Array<{ title: string; body: string; icon?: string }>;
}

export interface RichTextBlock {
  id: string;
  type: "richText";
  heading?: string;
  markdown: string;
}

export interface FaqBlock {
  id: string;
  type: "faq";
  heading?: string;
  items: Array<{ question: string; answer: string }>;
}

export interface CtaBlock {
  id: string;
  type: "cta";
  heading: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface PricingBlock {
  id: string;
  type: "pricing";
  heading?: string;
  subheading?: string;
  sector?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export type ContentBlock =
  | HeroBlock
  | FeaturesBlock
  | RichTextBlock
  | FaqBlock
  | CtaBlock
  | PricingBlock;

export interface ContentSeo {
  title?: string;
  description?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
}

export interface ContentNavLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface ContentFooterGroup {
  id: string;
  label: string;
  links: ContentNavLink[];
}

export interface ContentPage {
  slug: string;
  locale: ContentLocale;
  requestedLocale: ContentLocale;
  title: string;
  seo: ContentSeo;
  blocks: ContentBlock[];
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  updatedAt: string;
}

export interface ContentNavigation {
  locale: ContentLocale;
  header: ContentNavLink[];
  footer: ContentFooterGroup[];
  tagline: string | null;
  copyright: string | null;
}

export interface PublishedPageRef {
  slug: string;
  updatedAt: string;
}

export const HOME_SLUG = "home";
