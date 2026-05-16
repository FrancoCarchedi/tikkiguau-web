"use client";

import { CollarElement, ELEMENT_COLORS } from '@/types/collar';
import { forwardRef, useState } from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { EmojiRenderer } from '@/components/designer/custom-emojis/EmojiRenderer';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CollarPreviewProps {
  collarColor: string;
  elements: CollarElement[];
  onChangeColor?: (id: string, color: string) => void;
  onReorder?: (elements: CollarElement[]) => void;
  onRemoveElement?: (id: string) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
}

function SortableCollarItem({
  element,
  isSelected,
  onSelect,
  onRemove,
  interactive,
}: {
  element: CollarElement;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  interactive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: element.id, disabled: !interactive });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    cursor: interactive ? 'grab' : 'default',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-all ${
        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''
      } ${isDragging ? 'opacity-60' : ''}`}
      onClick={interactive ? onSelect : undefined}
      {...(interactive ? { ...attributes, ...listeners } : {})}
    >
      {interactive && (
        <GripHorizontal className="w-3 h-3 text-white/50" />
      )}
      {interactive && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className={`absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
      {element.type === 'emoji' ? (
        <EmojiRenderer
          emojiKey={element.value}
          fillColor={element.color || '#FAFAFA'}
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      ) : (
        <span
          className="font-bold select-none"
          style={{
            color: element.color,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            fontSize: '1.1rem',
          }}
        >
          {element.value}
        </span>
      )}
    </div>
  );
}

const CollarPreview = forwardRef<HTMLDivElement, CollarPreviewProps>(
  ({ collarColor, elements, onChangeColor, onReorder, onRemoveElement, selectedElementId, onSelectElement }, ref) => {
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const selectedId = selectedElementId !== undefined ? selectedElementId : internalSelectedId;
    const setSelectedId = onSelectElement ?? setInternalSelectedId;
    const interactive = !!(onChangeColor && onReorder);

    const sensors = useSensors(
      useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id && onReorder) {
        const oldIndex = elements.findIndex((e) => e.id === active.id);
        const newIndex = elements.findIndex((e) => e.id === over.id);
        onReorder(arrayMove(elements, oldIndex, newIndex));
      }
    };

    const selectedElement = elements.find((e) => e.id === selectedId);

    const elementsRow = (
      <div
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center gap-2"
        style={{ left: '20%', right: '20%' }}
      >
        {elements.map((el) => (
          <SortableCollarItem
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            interactive={interactive}
            onSelect={() => setSelectedId(el.id === selectedId ? null : el.id)}
            onRemove={onRemoveElement ? () => { onRemoveElement(el.id); if (selectedId === el.id) setSelectedId(null); } : undefined}
          />
        ))}
      </div>
    );

    return (
      <div
        ref={ref}
        className="relative flex flex-col items-center justify-center rounded-2xl bg-card p-8 shadow-card gap-4"
        style={{ minHeight: 200 }}
      >
        <div className="relative w-full max-w-lg">
          <div
            className="w-full h-16 rounded-full shadow-md border border-black/10"
            style={{ backgroundColor: collarColor }}
          />
          {elements.length > 0 && (
            interactive ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={elements} strategy={horizontalListSortingStrategy}>
                  {elementsRow}
                </SortableContext>
              </DndContext>
            ) : elementsRow
          )}
        </div>

        {interactive && selectedElement && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Color de la letra</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {ELEMENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeColor!(selectedId!, c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedElement.color === c ? 'border-primary scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {interactive && elements.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground italic text-center">
              Toca una letra o emoji para cambiar su color · Arrastra para reordenar
            </p>
            <p className="text-xs text-muted-foreground italic text-center">
              Haz clic en la X para eliminar el elemento
            </p>
          </div>
        )}

        {elements.length === 0 && (
          <p className="absolute bottom-4 text-sm text-muted-foreground italic">
            Agrega letras o emojis al collar
          </p>
        )}
      </div>
    );
  }
);

CollarPreview.displayName = 'CollarPreview';

export default CollarPreview;
