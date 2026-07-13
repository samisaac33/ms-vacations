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
  legalName: string;
  ruc: string;
  address: string;
  province: string;
  country: string;
  tourismRegistry?: string;
};
