'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  useCatalogBaseColors,
  useCreateCatalogBaseColor,
  useUpdateCatalogBaseColor,
} from '../hooks/use-catalog-base-colors'
import type { CatalogBaseColorDto } from '@/types/catalog'

function BaseColorForm({
  mode,
  color,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  color?: CatalogBaseColorDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(color?.name ?? '')
  const [hexValue, setHexValue] = useState(color?.hexValue ?? '#C70F11')
  const [sortOrder, setSortOrder] = useState(String(color?.sortOrder ?? 0))
  const { mutate: createColor, isPending: isCreating } = useCreateCatalogBaseColor()
  const { mutate: updateColor, isPending: isUpdating } = useUpdateCatalogBaseColor()
  const isPending = isCreating || isUpdating

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      hexValue: hexValue.trim(),
      sortOrder: Number(sortOrder) || 0,
    }

    if (mode === 'create') {
      createColor(payload, {
        onSuccess: () => {
          toast.success('Color creado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al crear el color'
          )
        },
      })
      return
    }

    if (!color) return

    updateColor(
      { id: color.id, ...payload },
      {
        onSuccess: () => {
          toast.success('Color actualizado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al actualizar el color'
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo color base' : 'Editar color base'}
          </DialogTitle>
        </DialogHeader>
        <form id="base-color-form" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="base-color-name">Nombre</Label>
            <Input
              id="base-color-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="base-color-hex">Color (#RRGGBB)</Label>
            <div className="flex gap-2">
              <Input
                id="base-color-hex"
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                required
              />
              <div
                className="size-9 shrink-0 rounded-md border"
                style={{ backgroundColor: hexValue }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="base-color-order">Orden</Label>
            <Input
              id="base-color-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="base-color-form" disabled={isPending || !name.trim()}>
            {isPending && <Spinner className="mr-2 size-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogBaseColorsPanel() {
  const { data: colors, isLoading } = useCatalogBaseColors()
  const { mutate: updateColor } = useUpdateCatalogBaseColor()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogBaseColorDto | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Colores de collar y correa</h2>
          <p className="text-xs text-muted-foreground">
            Colores base del material del producto
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <PlusIcon className="mr-1.5 size-4" />
                Agregar color
              </Button>
            }
          />
          <BaseColorForm mode="create" open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Hex</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              colors?.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>
                    <div
                      className="size-6 rounded-full border"
                      style={{ backgroundColor: color.hexValue }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{color.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{color.hexValue}</code>
                  </TableCell>
                  <TableCell>{color.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={color.isActive ? 'default' : 'secondary'}>
                      {color.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(color)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateColor(
                            { id: color.id, isActive: !color.isActive },
                            {
                              onSuccess: () =>
                                toast.success(
                                  color.isActive ? 'Color desactivado' : 'Color activado'
                                ),
                            }
                          )
                        }
                      >
                        {color.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <BaseColorForm
          mode="edit"
          color={editing}
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        />
      )}
    </div>
  )
}
