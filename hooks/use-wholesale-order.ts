'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { PublicCatalogDto } from '@/types/catalog'
import type {
  PublicWholesaleConfig,
  WholesaleCategory,
  WholesaleDraft,
  WholesaleOrderEvaluation,
  WholesaleOrderLine,
  WholesaleSizeValue,
} from '@/types/wholesale'
import { buildSortContext } from '@/lib/wholesale/catalog-options'
import { MAX_UNITS_PER_ITEM } from '@/lib/wholesale/constants'
import {
  clearWholesaleDraft,
  EMPTY_DRAFT,
  loadWholesaleDraft,
  saveWholesaleDraft,
} from '@/lib/wholesale/draft-storage'
import {
  buildGroupKey,
  evaluateWholesaleOrder,
  isSameLine,
  sortWholesaleLines,
} from '@/lib/wholesale/order-calculator'
import { normalizeSelection, type WholesaleSelection } from '@/lib/wholesale/selection'

interface OrderState {
  selection: WholesaleSelection | null
  lines: WholesaleOrderLine[]
  reference: string
  notes: string
  isHydrated: boolean
}

type OrderAction =
  | { type: 'hydrate'; draft: WholesaleDraft }
  | { type: 'select'; selection: WholesaleSelection | null }
  | { type: 'set-quantity'; line: Omit<WholesaleOrderLine, 'quantity'>; quantity: number }
  | { type: 'remove-group'; category: WholesaleCategory; size: WholesaleSizeValue; colorHex: string }
  | { type: 'set-reference'; reference: string }
  | { type: 'set-notes'; notes: string }
  | { type: 'clear' }

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0
  return Math.min(MAX_UNITS_PER_ITEM, Math.max(0, Math.floor(quantity)))
}

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        lines: action.draft.lines,
        reference: action.draft.reference,
        notes: action.draft.notes,
        isHydrated: true,
      }
    case 'select':
      return { ...state, selection: action.selection }
    case 'set-quantity': {
      const quantity = clampQuantity(action.quantity)
      const others = state.lines.filter((line) => !isSameLine(line, action.line))
      return {
        ...state,
        lines: quantity > 0 ? [...others, { ...action.line, quantity }] : others,
      }
    }
    case 'remove-group': {
      const groupKey = buildGroupKey(action.category, action.size, action.colorHex)
      return {
        ...state,
        lines: state.lines.filter(
          (line) => buildGroupKey(line.category, line.size, line.colorHex) !== groupKey
        ),
      }
    }
    case 'set-reference':
      return { ...state, reference: action.reference }
    case 'set-notes':
      return { ...state, notes: action.notes }
    case 'clear':
      return { ...state, lines: [], reference: '', notes: '' }
  }
}

interface UseWholesaleOrderParams {
  catalog: PublicCatalogDto
  config: PublicWholesaleConfig
}

export function useWholesaleOrder({ catalog, config }: UseWholesaleOrderParams) {
  const [state, dispatch] = useReducer(orderReducer, undefined, (): OrderState => ({
    selection: normalizeSelection(null, catalog, config),
    ...EMPTY_DRAFT,
    isHydrated: false,
  }))

  useEffect(() => {
    dispatch({ type: 'hydrate', draft: loadWholesaleDraft(catalog, config) })
  }, [catalog, config])

  useEffect(() => {
    if (!state.isHydrated) return
    saveWholesaleDraft({ lines: state.lines, reference: state.reference, notes: state.notes })
  }, [state.isHydrated, state.lines, state.reference, state.notes])

  const sortContext = useMemo(() => buildSortContext(catalog), [catalog])

  const sortedLines = useMemo(
    () => sortWholesaleLines(state.lines, sortContext),
    [state.lines, sortContext]
  )

  const evaluation: WholesaleOrderEvaluation = useMemo(
    () => evaluateWholesaleOrder(sortedLines, config),
    [sortedLines, config]
  )

  const selectCategory = useCallback(
    (category: WholesaleCategory) =>
      dispatch({
        type: 'select',
        selection: normalizeSelection({ ...state.selection, category }, catalog, config),
      }),
    [state.selection, catalog, config]
  )

  const selectSize = useCallback(
    (size: WholesaleSizeValue) =>
      dispatch({
        type: 'select',
        selection: normalizeSelection({ ...state.selection, size }, catalog, config),
      }),
    [state.selection, catalog, config]
  )

  const selectColor = useCallback(
    (colorHex: string) =>
      dispatch({
        type: 'select',
        selection: normalizeSelection({ ...state.selection, colorHex }, catalog, config),
      }),
    [state.selection, catalog, config]
  )

  const setQuantity = useCallback(
    (line: Omit<WholesaleOrderLine, 'quantity'>, quantity: number) =>
      dispatch({ type: 'set-quantity', line, quantity }),
    []
  )

  const removeGroup = useCallback(
    (category: WholesaleCategory, size: WholesaleSizeValue, colorHex: string) =>
      dispatch({ type: 'remove-group', category, size, colorHex }),
    []
  )

  const setReference = useCallback(
    (reference: string) => dispatch({ type: 'set-reference', reference }),
    []
  )

  const setNotes = useCallback((notes: string) => dispatch({ type: 'set-notes', notes }), [])

  const clearOrder = useCallback(() => {
    clearWholesaleDraft()
    dispatch({ type: 'clear' })
  }, [])

  return {
    selection: state.selection,
    lines: sortedLines,
    reference: state.reference,
    notes: state.notes,
    isHydrated: state.isHydrated,
    evaluation,
    selectCategory,
    selectSize,
    selectColor,
    setQuantity,
    removeGroup,
    setReference,
    setNotes,
    clearOrder,
  }
}
