export interface DeviceModelResponse {
  _id: string;
  brandId: string;
  name: string;
  image?: string;
  pcbImageFront?: string;
  pcbImageBack?: string;
  pcbImageFrontClean?: string;
  pcbImageBackClean?: string;
  bgImage?: string;
  createdAt: string;
}

export interface CreateModelDTO {
  brandId: string;
  name: string;
  image?: string;
}

export interface UpdateModelDTO {
  name?: string;
  image?: string;
  pcbImageFront?: string;
  pcbImageBack?: string;
  pcbImageFrontClean?: string;
  pcbImageBackClean?: string;
  bgImage?: string;
}
