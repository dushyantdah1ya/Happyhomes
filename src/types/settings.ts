export interface SocialProfiles {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

export interface BusinessSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  directionsUrl?: string;
  officeHours?: string;
  socials: SocialProfiles;
  operationalSettings?: {
    availabilityReviewIntervalDays: number;
    brochureReviewIntervalDays: number;
  };
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  phone: '+91 98280 12345',
  whatsapp: '+919828012345',
  email: 'info@happyhomesjaipur.com',
  address: 'Plot No. 12, Vaishali Nagar, Jaipur, Rajasthan 302021',
  directionsUrl: 'https://maps.app.goo.gl/example',
  officeHours: 'Mon - Sat: 10:00 AM - 7:00 PM',
  socials: {
    instagram: 'https://instagram.com/happyhomesjaipur',
    facebook: 'https://facebook.com/happyhomesjaipur',
    linkedin: 'https://linkedin.com/company/happyhomesjaipur',
  },
  operationalSettings: {
    availabilityReviewIntervalDays: 30,
    brochureReviewIntervalDays: 90,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system-default',
};
