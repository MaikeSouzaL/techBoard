export interface BrandResponse {
  _id: string; // MongoDB usa _id em formato string no JSON
  name: string;
  logo?: string;
  createdAt: string;
}

export interface CreateBrandDTO {
  name: string;
  logo?: string;
}

export interface UpdateBrandDTO {
  name?: string;
  logo?: string;
}
