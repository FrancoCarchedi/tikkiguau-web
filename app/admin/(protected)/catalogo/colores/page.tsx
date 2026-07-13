import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { CatalogBaseColorsPanel } from '../../components/catalog-base-colors-panel'
import { CatalogElementColorsPanel } from '../../components/catalog-element-colors-panel'

export default function CatalogoColoresPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Catálogo · Colores</h1>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-6">
        <CatalogBaseColorsPanel />
        <CatalogElementColorsPanel />
      </div>
    </>
  )
}
