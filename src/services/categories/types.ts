export interface CategoryResponse {
  _id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
  color?: string;
}
