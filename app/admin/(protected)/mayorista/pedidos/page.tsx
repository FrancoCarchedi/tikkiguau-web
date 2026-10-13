import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { WholesaleOrdersTable } from '../../components/wholesale-orders-table'

export default function MayoristaPedidosPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Mayorista · Pedidos</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <WholesaleOrdersTable />
      </div>
    </>
  )
}
