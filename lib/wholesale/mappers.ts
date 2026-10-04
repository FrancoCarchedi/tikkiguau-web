import type {
  WholesalePriceRule,
  WholesaleSettings,
} from '@/app/generated/prisma/client'
import { WholesaleSize } from '@/app/generated/prisma/client'
import type {
  WholesalePriceRuleDto,
  WholesaleSettingsDto,
  WholesaleSizeValue,
} from '@/types/wholesale'

const SIZE_TO_VALUE: Record<WholesaleSize, WholesaleSizeValue> = {
  [WholesaleSize.SIZE_1]: '1',
  [WholesaleSize.SIZE_2]: '2',
}

export function mapWholesalePriceRule(rule: WholesalePriceRule): WholesalePriceRuleDto {
  return {
    id: rule.id,
    category: rule.category,
    size: SIZE_TO_VALUE[rule.size],
    unitPriceArs: rule.unitPriceArs,
    minUnitsPerColor: rule.minUnitsPerColor,
    isActive: rule.isActive,
  }
}

export function mapWholesaleSettings(settings: WholesaleSettings): WholesaleSettingsDto {
  return {
    isEnabled: settings.isEnabled,
    requireMinTotalUnits: settings.requireMinTotalUnits,
    minTotalUnits: settings.minTotalUnits,
    requireMinTotalAmount: settings.requireMinTotalAmount,
    minTotalAmountArs: settings.minTotalAmountArs,
  }
}
