export interface CategorySubcategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
}

export interface CategoryRow {
  id: number;
  name: string;
  subcategories: CategorySubcategory[];
}

export function normalizeCategoriesPayload(payload: unknown): CategoryRow[] | null;
