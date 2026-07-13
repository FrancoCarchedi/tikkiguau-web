'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { EmojiRenderer } from '@/components/designer/custom-emojis/EmojiRenderer'
import { useCatalogElementColors } from '../hooks/use-catalog-element-colors'
import {
  useCatalogEmojis,
  useCreateCatalogEmoji,
  useDeleteCatalogEmoji,
  useUpdateCatalogEmoji,
} from '../hooks/use-catalog-emojis'
import type { CatalogEmojiDto } from '@/types/catalog'

function EmojiFormDialog({
  mode,
  emoji,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  emoji?: CatalogEmojiDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: elementColors } = useCatalogElementColors()
  const { mutate: createEmoji, isPending: isCreating } = useCreateCatalogEmoji()
  const { mutate: updateEmoji, isPending: isUpdating } = useUpdateCatalogEmoji()
  const isPending = isCreating || isUpdating

  const [key, setKey] = useState(emoji?.key ?? '')
  const [label, setLabel] = useState(emoji?.label ?? '')
  const [svgMarkup, setSvgMarkup] = useState(emoji?.svgMarkup ?? '')
  const [sortOrder, setSortOrder] = useState(String(emoji?.sortOrder ?? 0))
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(
    emoji?.colorIds ?? []
  )
  const [availableSizes, setAvailableSizes] = useState<Array<'1' | '2'>>(
    emoji?.availableSizes ?? ['1', '2']
  )

  useEffect(() => {
    if (open) {
      setKey(emoji?.key ?? '')
      setLabel(emoji?.label ?? '')
      setSvgMarkup(emoji?.svgMarkup ?? '')
      setSortOrder(String(emoji?.sortOrder ?? 0))
      setSelectedColorIds(emoji?.colorIds ?? [])
      setAvailableSizes(emoji?.availableSizes ?? ['1', '2'])
    }
  }, [open, emoji])

  async function handleFileChange(file: File | null) {
    if (!file) return
    const text = await file.text()
    setSvgMarkup(text)
  }

  function toggleColor(colorId: string) {
    setSelectedColorIds((current) =>
      current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId]
    )
  }

  function toggleSize(size: '1' | '2') {
    setAvailableSizes((current) => {
      if (current.includes(size)) {
        if (current.length === 1) return current
        return current.filter((entry) => entry !== size)
      }
      return [...current, size].sort() as Array<'1' | '2'>
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      key: key.trim().toLowerCase(),
      label: label.trim(),
      svgMarkup,
      sortOrder: Number(sortOrder) || 0,
      colorIds: selectedColorIds,
      availableSizes,
    }

    if (mode === 'create') {
      createEmoji(payload, {
        onSuccess: () => {
          toast.success('Emoji creado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al crear el emoji'
          )
        },
      })
      return
    }

    if (!emoji) return

    updateEmoji(
      { id: emoji.id, ...payload },
      {
        onSuccess: () => {
          toast.success('Emoji actualizado')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al actualizar el emoji'
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo emoji' : 'Editar emoji'}
          </DialogTitle>
        </DialogHeader>
        <form id="emoji-form" onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emoji-key">Clave</Label>
              <Input
                id="emoji-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="patitas"
                required
                disabled={mode === 'edit'}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emoji-label">Nombre</Label>
              <Input
                id="emoji-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emoji-svg-file">Archivo SVG</Label>
            <Input
              id="emoji-svg-file"
              type="file"
              accept=".svg,image/svg+xml"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emoji-svg">SVG</Label>
            <Textarea
              id="emoji-svg"
              value={svgMarkup}
              onChange={(e) => setSvgMarkup(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              required
            />
          </div>

          {svgMarkup && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Vista previa</span>
              <EmojiRenderer
                emojiKey={key || 'preview'}
                svgMarkup={svgMarkup}
                fillColor="#C70F11"
                style={{ width: '2rem', height: '2rem' }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Colores permitidos</Label>
            <div className="flex flex-wrap gap-2">
              {elementColors?.map((color) => {
                const selected = selectedColorIds.includes(color.id)
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={`size-8 rounded-full border-2 ${
                      selected ? 'border-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hexValue }}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tallas disponibles</Label>
            <p className="text-xs text-muted-foreground">
              Definí en qué tallas de collar/correa se puede usar este emoji
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: '1' as const, label: 'Talla 1 (chica)' },
                  { value: '2' as const, label: 'Talla 2 (grande)' },
                ] as const
              ).map((size) => {
                const selected = availableSizes.includes(size.value)
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => toggleSize(size.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emoji-order">Orden</Label>
            <Input
              id="emoji-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="emoji-form"
            disabled={
              isPending ||
              !key.trim() ||
              !label.trim() ||
              !svgMarkup.trim() ||
              availableSizes.length === 0
            }
          >
            {isPending && <Spinner className="mr-2 size-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogEmojisPanel() {
  const { data: emojis, isLoading } = useCatalogEmojis()
  const { mutate: updateEmoji } = useUpdateCatalogEmoji()
  const { mutate: deleteEmoji, isPending: isDeleting } = useDeleteCatalogEmoji()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogEmojiDto | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Emojis personalizados</h2>
          <p className="text-xs text-muted-foreground">
            Subí, editá o desactivá emojis con archivos SVG
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <PlusIcon className="mr-1.5 size-4" />
                Nuevo emoji
              </Button>
            }
          />
          <EmojiFormDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tallas</TableHead>
              <TableHead>Colores</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              emojis?.map((emoji) => (
                <TableRow key={emoji.id}>
                  <TableCell>
                    <EmojiRenderer
                      emojiKey={emoji.key}
                      svgMarkup={emoji.svgMarkup}
                      fillColor="#C70F11"
                      style={{ width: '1.5rem', height: '1.5rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{emoji.key}</code>
                  </TableCell>
                  <TableCell className="font-medium">{emoji.label}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {emoji.availableSizes.map((size) => (
                        <Badge key={size} variant="outline">
                          Talla {size}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{emoji.colors.length}</TableCell>
                  <TableCell>
                    <Badge variant={emoji.isActive ? 'default' : 'secondary'}>
                      {emoji.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(emoji)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateEmoji(
                            { id: emoji.id, isActive: !emoji.isActive },
                            {
                              onSuccess: () =>
                                toast.success(
                                  emoji.isActive ? 'Emoji desactivado' : 'Emoji activado'
                                ),
                            }
                          )
                        }
                      >
                        {emoji.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={() => {
                          if (!confirm(`¿Eliminar el emoji "${emoji.label}"?`)) return
                          deleteEmoji(emoji.id, {
                            onSuccess: () => toast.success('Emoji eliminado'),
                            onError: (err) => {
                              toast.error(
                                (err.response as { data?: { message?: string } } | undefined)
                                  ?.data?.message ?? 'Error al eliminar el emoji'
                              )
                            },
                          })
                        }}
                      >
                        <Trash2Icon className="size-4" />
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
        <EmojiFormDialog
          mode="edit"
          emoji={editing}
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        />
      )}
    </div>
  )
}
