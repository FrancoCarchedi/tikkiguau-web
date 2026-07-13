"use client";

import { CollarElement } from '@/types/collar';
import { forwardRef } from 'react';
import { EmojiRenderer } from '@/components/designer/custom-emojis/EmojiRenderer';

interface LeashPreviewProps {
  leashColor: string;
  elements: CollarElement[];
}

const LeashPreview = forwardRef<HTMLDivElement, LeashPreviewProps>(
  ({ leashColor, elements }, ref) => {
    const strapHeight = Math.max(200, elements.length * 32 + 40);
    const emojiSize = elements.length > 7 ? '1rem' : '1.2rem';

    return (
      <div
        ref={ref}
        className="relative flex items-center justify-center rounded-2xl bg-card p-8 shadow-card overflow-hidden"
        style={{ minHeight: 280 }}
      >
        <div className="relative w-full max-w-lg flex flex-col items-center">
          <div
            className="w-16 h-24 rounded-t-full border-4 shrink-0"
            style={{ borderColor: leashColor, backgroundColor: 'transparent' }}
          />
          <div
            className="w-8 rounded-b-sm shadow-md flex flex-col items-center justify-evenly py-3 shrink-0"
            style={{ backgroundColor: leashColor, height: strapHeight }}
          >
            {elements.map((el) => (
              el.type === 'emoji' ? (
                <EmojiRenderer
                  key={el.id}
                  emojiKey={el.value}
                  fillColor={el.color || '#FAFAFA'}
                  style={{ width: emojiSize, height: emojiSize, flexShrink: 0 }}
                />
              ) : (
                <span
                  key={el.id}
                  className="select-none leading-none font-bold"
                  style={{ fontSize: emojiSize, color: el.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {el.value}
                </span>
              )
            ))}
          </div>
        </div>

        {elements.length === 0 && (
          <p className="absolute bottom-4 text-sm text-muted-foreground italic">
            Agrega emojis a la correa
          </p>
        )}
      </div>
    );
  }
);

LeashPreview.displayName = 'LeashPreview';

export default LeashPreview;
