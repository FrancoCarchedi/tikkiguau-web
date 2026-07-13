import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { CatalogLettersPanel } from '../../components/catalog-letters-panel'

export default function CatalogoLetrasPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Catálogo · Letras</h1>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <CatalogLettersPanel />
      </div>
    </>
  )
}
