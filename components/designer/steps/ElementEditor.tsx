"use client";

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Trash2, X } from 'lucide-react';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import { EmojiRenderer } from '@/components/designer/custom-emojis/EmojiRenderer';
import {
  getActiveEmojis,
  getActiveLetters,
  getAllowedElementColors,
  getDefaultElementColor,
} from '@/lib/catalog/catalog-helpers';
import type { CollarElement } from '@/types/collar';

interface ElementEditorProps {
  elements: CollarElement[];
  onAddElement: (el: Omit<CollarElement, 'id'>) => void;
  onRemoveElement: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onReorder: (elements: CollarElement[]) => void;
  onClear: () => void;
  maxElements: number;
  minElements: number;
  mode?: 'collar' | 'leash';
  size?: '1' | '2';
  title?: string;
  subtitle?: string;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
}

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

function SortableElement({
  element,
  onRemove,
  selectedForColor,
  onSelectForColor,
}: {
  element: CollarElement;
  onRemove: () => void;
  selectedForColor: boolean;
  onSelectForColor: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelectForColor}
      className={`relative group flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors cursor-grab active:cursor-grabbing ${
        selectedForColor
          ? 'border-primary bg-neutral-700'
          : 'border-transparent bg-neutral-800 hover:border-transparent'
      }`}
    >
      <GripHorizontal className="w-3 h-3 text-neutral-400" />
      {element.type === 'emoji' ? (
        <EmojiRenderer
          emojiKey={element.value}
          fillColor={element.color || '#FAFAFA'}
          style={{ width: '1.5rem', height: '1.5rem' }}
        />
      ) : (
        <span className="text-xl font-bold select-none" style={{ color: element.color }}>
          {element.value}
        </span>
      )}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className={`absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center transition-opacity ${
          selectedForColor ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

export default function ElementEditor({
  elements,
  onAddElement,
  onRemoveElement,
  onChangeColor,
  onReorder,
  onClear,
  maxElements,
  minElements,
  mode = 'collar',
  size = '1',
  title = 'Personaliza tu collar',
  subtitle,
  selectedElementId,
  onSelectElement,
}: ElementEditorProps) {
  const catalog = useRequiredCatalog();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = selectedElementId !== undefined ? selectedElementId : internalSelectedId;
  const setSelectedId = onSelectElement ?? setInternalSelectedId;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const isFull = elements.length >= maxElements;
  const showLetters = mode === 'collar' || mode === 'leash';
  const activeLetters = new Set(getActiveLetters(catalog));
  const activeEmojis = getActiveEmojis(catalog, size);
  const defaultColor = getDefaultElementColor(catalog);
  const selectedElement = elements.find((element) => element.id === selectedId);
  const allowedColors = selectedElement
    ? getAllowedElementColors(catalog, selectedElement)
    : catalog.elementColors.map((color) => color.hexValue);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex((element) => element.id === active.id);
      const newIndex = elements.findIndex((element) => element.id === over.id);
      onReorder(arrayMove(elements, oldIndex, newIndex));
    }
  };

  const letterRows = QWERTY_ROWS.map((row) =>
    row.filter((letter) => activeLetters.has(letter))
  ).filter((row) => row.length > 0);

  return (
    <div className="space-y-5">
      <div className="text-left md:text-center">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">
          {subtitle ||
            `Agrega ${showLetters ? 'letras y ' : ''}emojis (${elements.length}/${maxElements}, mínimo ${minElements})`}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground space-y-1.5 text-left">
        <p className="font-medium text-foreground">Cómo personalizar</p>
        <ul className="list-disc pl-4 space-y-1 leading-relaxed">
          <li>
            Tocá {showLetters ? 'las letras o los emojis' : 'los emojis'} de abajo para agregarlos.
          </li>
          <li>
            Seleccioná un elemento de la lista para cambiar su color.
          </li>
          <li>
            Arrastrá los elementos para cambiar el orden.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {elements.length > 0 ? 'Elementos' : 'No hay elementos seleccionados'}
          </span>
          {elements.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setSelectedId(null);
              }}
              className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={elements} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-2 min-h-16 content-start">
              {elements.map((element) => (
                <SortableElement
                  key={element.id}
                  element={element}
                  onRemove={() => {
                    onRemoveElement(element.id);
                    if (selectedId === element.id) setSelectedId(null);
                  }}
                  selectedForColor={selectedId === element.id}
                  onSelectForColor={() =>
                    setSelectedId(element.id === selectedId ? null : element.id)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {selectedId && selectedElement && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Color del elemento</span>
            <button
              type="button"
              onClick={() => {
                onRemoveElement(selectedId);
                setSelectedId(null);
              }}
              className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {allowedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChangeColor(selectedId, color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedElement.color === color
                    ? 'border-primary scale-110'
                    : 'border-border'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {showLetters && letterRows.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Letras</span>
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex flex-col gap-1.5">
              {letterRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex justify-start gap-1 sm:gap-1.5"
                  style={{
                    paddingLeft: rowIndex === 1 ? '1rem' : rowIndex === 2 ? '2rem' : '0',
                  }}
                >
                  {row.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      disabled={isFull}
                      onClick={() =>
                        onAddElement({ type: 'letter', value: letter, color: defaultColor })
                      }
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-border bg-secondary text-secondary-foreground font-semibold text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground hover:border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeEmojis.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Emojis</span>
          <div className="flex gap-2 flex-wrap">
            {activeEmojis.map((emoji) => (
              <button
                key={emoji.id}
                type="button"
                disabled={isFull}
                onClick={() =>
                  onAddElement({ type: 'emoji', value: emoji.key, color: defaultColor })
                }
                title={emoji.label}
                className="w-11 h-11 rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center p-2 focus-visible:outline-none"
              >
                <EmojiRenderer
                  emojiKey={emoji.key}
                  fillColor="#C70F11"
                  style={{ width: '100%', height: '100%' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
