export const attachCountsAndDropEmpty = (categories = [], countBySubcategoryId = {}) =>
    categories
        .map((category) => {
            const rawSubs = category.subcategories || category.Subcategories || [];
            const subcategories = rawSubs
                .map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                    description: sub.description,
                    categoryId: sub.categoryId || sub.category_id || category.id,
                    totalItems: Number(countBySubcategoryId[sub.id] || 0)
                }))
                .filter((sub) => sub.totalItems > 0);

            return {
                id: category.id,
                name: category.name,
                subcategories
            };
        })
        .filter((category) => category.subcategories.length > 0);

export const countMapFromRows = (rows = []) => {
    const countMap = {};
    for (const row of rows) {
        const id = row.subcategory_id ?? row.subcategoryId;
        if (id === undefined || id === null) continue;
        countMap[id] = Number(row.totalItems ?? row.total_items ?? 0);
    }
    return countMap;
};
