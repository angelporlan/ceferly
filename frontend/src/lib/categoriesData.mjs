const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const asText = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeCategoriesPayload(payload) {
  if (!Array.isArray(payload)) return null;

  return payload.flatMap((category) => {
    if (!category || typeof category !== "object" || Array.isArray(category)) return [];

    const id = parseId(category.id);
    const name = asText(category.name);
    if (id === null || !name) return [];

    const rawSubcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
    const subcategories = rawSubcategories.flatMap((subcategory) => {
      if (!subcategory || typeof subcategory !== "object" || Array.isArray(subcategory)) return [];

      const subcategoryId = parseId(subcategory.id);
      const subcategoryName = asText(subcategory.name);
      const totalItems = Number(subcategory.totalItems);
      if (subcategoryId === null || !subcategoryName || !Number.isFinite(totalItems) || totalItems <= 0) return [];

      return [{
        id: subcategoryId,
        name: subcategoryName,
        description: asText(subcategory.description),
        categoryId: parseId(subcategory.categoryId ?? subcategory.category_id) ?? id,
      }];
    });

    return subcategories.length > 0 ? [{ id, name, subcategories }] : [];
  });
}
