'use client';

import React from 'react';

import { PlateElement } from './plate-element';

export function CodeLineElement(
  props: React.ComponentProps<typeof PlateElement>
) {
  return <PlateElement {...props} />;
}
