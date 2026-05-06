'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { PlusIcon } from 'lucide-react'
import { useCreateStore } from '../hooks/use-create-store'
import { useUpdateStore } from '../hooks/use-update-store'
import type { Store } from '../types/store'

type Props =
  | { mode: 'create'; store?: never; open?: never; onOpenChange?: never }
  | { mode: 'edit'; store: Store; open?: boolean; onOpenChange?: (open: boolean) => void }

export function StoreFormDialog({ mode, store, open: controlledOpen, onOpenChange: controlledOnOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (v: boolean) => {
    setInternalOpen(v)
    controlledOnOpenChange?.(v)
  }
  const [name, setName] = useState('')
  const [keyword, setKeyword] = useState('')

  const { mutate: createStore, isPending: isCreating } = useCreateStore()
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore()
  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (open) {
      setName(mode === 'edit' ? store.name : '')
      setKeyword(mode === 'edit' ? store.keyword : '')
    }
  }, [open, mode, store])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !keyword.trim()) return

    if (mode === 'create') {
      createStore(
        { name: name.trim(), keyword: keyword.trim() },
        {
          onSuccess: () => {
            toast.success('Tienda creada correctamente')
            setOpen(false)
          },
          onError: (err) => {
            const message =
              (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al crear la tienda'
            toast.error(message)
          },
        }
      )
    } else {
      updateStore(
        { id: store.id, name: name.trim(), keyword: keyword.trim() },
        {
          onSuccess: () => {
            toast.success('Tienda actualizada correctamente')
            setOpen(false)
          },
          onError: (err) => {
            const message =
              (err.response as { data?: { message?: string } } | undefined)?.data?.message ??
              'Error al actualizar la tienda'
            toast.error(message)
          },
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === 'create' ? (
            <Button size="sm">
              <PlusIcon className="size-4 mr-1.5" />
              Crear nueva tienda
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              Editar
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear nueva tienda' : 'Editar tienda'}
          </DialogTitle>
        </DialogHeader>

        <form id="store-form" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">Nombre</Label>
            <Input
              id="store-name"
              placeholder="Ej: Tienda Centro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-keyword">Palabra clave</Label>
            <Input
              id="store-keyword"
              placeholder="Ej: centro2024"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toLowerCase().replace(/\s/g, ''))}
              required
            />
            <p className="text-xs text-muted-foreground">
              La usarán las tiendas para identificarse al crear órdenes. Solo minúsculas, sin espacios.
            </p>
          </div>
        </form>

        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="store-form"
            disabled={isPending || !name.trim() || !keyword.trim()}
          >
            {isPending && <Spinner className="mr-2 size-4" />}
            {mode === 'create' ? 'Crear tienda' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
