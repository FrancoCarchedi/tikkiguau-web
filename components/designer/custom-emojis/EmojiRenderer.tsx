"use client";

import React from 'react';
import Calavera from './Calavera';
import Corazon from './Corazon';
import Energia from './Energia';
import Estrella from './Estrella';
import Flor from './Flor';
import Luna from './Luna';
import Patitas from './Patitas';
import Pez from './Pez';

export interface CustomEmojiProps extends React.SVGProps<SVGSVGElement> {
  fillColor?: string;
}

const EMOJI_MAP: Record<string, React.ComponentType<CustomEmojiProps>> = {
  calavera: Calavera,
  corazon: Corazon,
  energia: Energia,
  estrella: Estrella,
  flor: Flor,
  luna: Luna,
  patitas: Patitas,
  pez: Pez,
};

interface EmojiRendererProps extends CustomEmojiProps {
  emojiKey: string;
}

export const EmojiRenderer = ({ emojiKey, ...props }: EmojiRendererProps) => {
  const Component = EMOJI_MAP[emojiKey];
  if (!Component) return null;
  return <Component {...props} />;
};
