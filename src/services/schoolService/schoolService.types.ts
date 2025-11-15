export interface SchoolImageContentDto {
  fileId: string;
  fileType: string;
  contentType: string;
  base64Data?: string;
  uploadedAt: string;
}

export interface SchoolDto {
  id: string;
  schoolName: string;
  slogan?: string;
  shortDescription?: string;
  fullDescription?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  fullAddress?: string;
  displayAddress?: string;
  latitude?: number;
  longitude?: number;
  footerText?: string;
  logoFileId?: string;
  logoImageBase64?: string;
  logoImageContentType?: string;
  bannerImage?: SchoolImageContentDto;
  stayConnectedImage?: SchoolImageContentDto;
  featureImage?: SchoolImageContentDto;
  galleryImages?: SchoolImageContentDto[];
  isPublished: boolean;
  isActive: boolean;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateSchoolRequest {
  schoolName: string;
  slogan?: string;
  shortDescription?: string;
  fullDescription?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  fullAddress?: string;
  displayAddress?: string;
  latitude?: number;
  longitude?: number;
  footerText?: string;
  isPublished: boolean;
  internalNotes?: string;
}

export interface SchoolLocationRequest {
  latitude: number;
  longitude: number;
  fullAddress?: string;
  displayAddress?: string;
}

