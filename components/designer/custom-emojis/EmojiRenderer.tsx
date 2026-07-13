"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useCatalogContext } from '@/components/catalog/catalog-provider';
import Calavera from '@/components/designer/custom-emojis/Calavera';
import Corazon from '@/components/designer/custom-emojis/Corazon';
import Energia from '@/components/designer/custom-emojis/Energia';
import Estrella from '@/components/designer/custom-emojis/Estrella';
import Flor from '@/components/designer/custom-emojis/Flor';
import Luna from '@/components/designer/custom-emojis/Luna';
import Patitas from '@/components/designer/custom-emojis/Patitas';
import Pez from '@/components/designer/custom-emojis/Pez';

export interface CustomEmojiProps extends React.HTMLAttributes<HTMLSpanElement> {
  fillColor?: string;
  emojiKey: string;
  svgMarkup?: string;
}

type EmojiComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { fillColor?: string }
>;

/** Fallback offline / seed sin markup en BD. El CMS (svgMarkup) tiene prioridad. */
const EMOJI_COMPONENTS: Record<string, EmojiComponent> = {
  calavera: Calavera,
  corazon: Corazon,
  energia: Energia,
  estrella: Estrella,
  flor: Flor,
  luna: Luna,
  patitas: Patitas,
  pez: Pez,
};

export const EmojiRenderer = ({
  emojiKey,
  svgMarkup,
  fillColor = '#C70F11',
  style,
  className,
  ...props
}: CustomEmojiProps) => {
  const catalog = useCatalogContext();
  const catalogMarkup = catalog?.emojis.find((emoji) => emoji.key === emojiKey)?.svgMarkup;
  const markup = (svgMarkup ?? catalogMarkup)?.trim() || undefined;

  if (markup) {
    return (
      <span
        {...props}
        className={cn(
          'inline-flex items-center justify-center leading-none [&_svg]:block [&_svg]:h-full [&_svg]:w-full',
          className
        )}
        style={{
          color: fillColor,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: markup }}
        aria-hidden
      />
    );
  }

  const Component = EMOJI_COMPONENTS[emojiKey];
  if (Component) {
    return (
      <span
        {...props}
        className={cn('inline-flex items-center justify-center leading-none', className)}
        style={style}
        aria-hidden
      >
        <Component fillColor={fillColor} style={{ width: '100%', height: '100%' }} />
      </span>
    );
  }

  return null;
};
