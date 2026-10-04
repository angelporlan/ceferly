export interface DashboardCatalogItem {
  id: string
  title: string
  category: string
}

export function mapDashboardCatalog(data: unknown): DashboardCatalogItem[]
