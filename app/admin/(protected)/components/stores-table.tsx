'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { useStores } from '../hooks/use-stores'
import { StoreFormDialog } from './store-form-dialog'

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function StoresTable() {
  const { data: stores, isLoading, isError } = useStores()
  const [selectedStore, setSelectedStore] = useState<import('../types/store').Store | null>(null)

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertDescription>
          Error al cargar las tiendas. Por favor, recargá la página.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold">Tiendas</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading ? '…' : `${stores?.length ?? 0} tienda${stores?.length === 1 ? '' : 's'} registrada${stores?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <StoreFormDialog mode="create" />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Palabra clave</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="whitespace-nowrap">Creada</TableHead>
              <TableHead className="whitespace-nowrap">Actualizada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : !stores || stores.length === 0
              ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground text-sm"
                    >
                      No hay tiendas registradas aún.
                    </TableCell>
                  </TableRow>
                )
              : stores.map((store) => (
                  <TableRow
                    key={store.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedStore(store)}
                  >
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {store.keyword}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? 'default' : 'secondary'}>
                        {store.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(store.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(store.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {selectedStore && (
        <StoreFormDialog
          mode="edit"
          store={selectedStore}
          open={!!selectedStore}
          onOpenChange={(v) => { if (!v) setSelectedStore(null) }}
        />
      )}
    </>
  )
}
