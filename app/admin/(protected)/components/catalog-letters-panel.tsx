'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useCatalogElementColors } from '../hooks/use-catalog-element-colors'
import { useCatalogLetters, useUpdateCatalogLetter } from '../hooks/use-catalog-letters'
import type { CatalogLetterDto } from '@/types/catalog'

function LetterColorsDialog({
  letter,
  open,
  onOpenChange,
}: {
  letter: CatalogLetterDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: elementColors } = useCatalogElementColors()
  const { mutate: updateLetter, isPending } = useUpdateCatalogLetter()
  const [selectedIds, setSelectedIds] = useState<string[]>(letter.colorIds)

  function toggleColor(colorId: string) {
    setSelectedIds((current) =>
      current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId]
    )
  }

  function handleSave() {
    updateLetter(
      { id: letter.id, colorIds: selectedIds },
      {
        onSuccess: () => {
          toast.success(`Colores de "${letter.letter}" actualizados`)
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(
            (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al actualizar la letra'
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Colores para la letra {letter.letter}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-2">
          {elementColors?.map((color) => {
            const selected = selectedIds.includes(color.id)
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => toggleColor(color.id)}
                className={`size-8 rounded-full border-2 transition-transform ${
                  selected ? 'border-primary scale-110' : 'border-border'
                }`}
                style={{ backgroundColor: color.hexValue }}
                title={color.hexValue}
              />
            )
          })}
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Spinner className="mr-2 size-4" />}
            Guardar colores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogLettersPanel() {
  const { data: letters, isLoading } = useCatalogLetters()
  const { mutate: updateLetter } = useUpdateCatalogLetter()
  const [editingLetter, setEditingLetter] = useState<CatalogLetterDto | null>(null)

  const sortedLetters = useMemo(
    () => [...(letters ?? [])].sort((a, b) => a.letter.localeCompare(b.letter)),
    [letters]
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold">Letras A–Z</h2>
        <p className="text-xs text-muted-foreground">
          Configurá qué colores están disponibles para cada letra
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando letras...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {sortedLetters.map((letter) => (
            <div
              key={letter.id}
              className="flex flex-col gap-2 rounded-lg border bg-card p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{letter.letter}</span>
                <Badge variant={letter.isActive ? 'default' : 'secondary'}>
                  {letter.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {letter.colors.slice(0, 6).map((color) => (
                  <span
                    key={color.id}
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: color.hexValue }}
                  />
                ))}
                {letter.colors.length > 6 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{letter.colors.length - 6}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingLetter(letter)}
                >
                  Colores
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateLetter(
                      { id: letter.id, isActive: !letter.isActive },
                      {
                        onSuccess: () =>
                          toast.success(
                            letter.isActive ? 'Letra desactivada' : 'Letra activada'
                          ),
                      }
                    )
                  }
                >
                  {letter.isActive ? 'Off' : 'On'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingLetter && (
        <LetterColorsDialog
          letter={editingLetter}
          open={!!editingLetter}
          onOpenChange={(open) => {
            if (!open) setEditingLetter(null)
          }}
        />
      )}
    </div>
  )
}
