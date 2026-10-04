const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

export const mapDashboardCatalog = (data) => {
  if (!Array.isArray(data)) return []

  return data.flatMap((category) => {
    if (!isRecord(category) || typeof category.name !== 'string' || !category.name.trim()) return []

    const subcategories = Array.isArray(category.subcategories)
      ? category.subcategories
      : Array.isArray(category.Subcategories)
        ? category.Subcategories
        : []

    return subcategories.flatMap((subcategory) => {
      if (!isRecord(subcategory)) return []

      const hasValidId =
        (typeof subcategory.id === 'number' && Number.isFinite(subcategory.id)) ||
        (typeof subcategory.id === 'string' && subcategory.id.trim().length > 0)

      if (
        !hasValidId ||
        typeof subcategory.name !== 'string' ||
        !subcategory.name.trim() ||
        typeof subcategory.totalItems !== 'number' ||
        !Number.isFinite(subcategory.totalItems) ||
        subcategory.totalItems <= 0
      ) {
        return []
      }

      return [{
        id: String(subcategory.id),
        title: subcategory.name,
        category: category.name,
      }]
    })
  })
}
