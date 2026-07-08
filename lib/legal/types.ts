export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalContactInfo = {
  siteName: string;
  siteUrl: string;
  contactEmail?: string;
  contactWhatsapp: string;
};
