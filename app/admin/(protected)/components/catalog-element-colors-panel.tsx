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
  useCatalogElementColors,
  useCreateCatalogElementColor,
  useUpdateCatalogElementColor,
} from '../hooks/use-catalog-element-colors'
import type { CatalogElementColorDto } from '@/types/catalog'

function ElementColorForm({
  mode,
  color,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  color?: CatalogElementColorDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [hexValue, setHexValue] = useState(color?.hexValue ?? '#FAFAFA')
  const [sortOrder, setSortOrder] = useState(String(color?.sortOrder ?? 0))
  const { mutate: createColor, isPending: isCreating } = useCreateCatalogElementColor()
  const { mutate: updateColor, isPending: isUpdating } = useUpdateCatalogElementColor()
  const isPending = isCreating || isUpdating

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      hexValue: hexValue.trim(),
      sortOrder: Number(sortOrder) || 0,
    }

    if (mode === 'create') {
      createColor(payload, {
        onSuccess: () => {
          toast.success('Color de elemento creado')
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
            {mode === 'create' ? 'Nuevo color de elemento' : 'Editar color de elemento'}
          </DialogTitle>
        </DialogHeader>
        <form id="element-color-form" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="element-color-hex">Color (#RRGGBB)</Label>
            <div className="flex gap-2">
              <Input
                id="element-color-hex"
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
            <Label htmlFor="element-color-order">Orden</Label>
            <Input
              id="element-color-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="element-color-form" disabled={isPending}>
            {isPending && <Spinner className="mr-2 size-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogElementColorsPanel() {
  const { data: colors, isLoading } = useCatalogElementColors()
  const { mutate: updateColor } = useUpdateCatalogElementColor()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogElementColorDto | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Colores de letras y emojis</h2>
          <p className="text-xs text-muted-foreground">
            Paleta disponible para personalizar elementos
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
          <ElementColorForm mode="create" open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Hex</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
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
        <ElementColorForm
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
