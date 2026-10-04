"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useRequiredCatalog } from "@/components/catalog/catalog-provider";
import { useWholesaleOrder } from "@/hooks/use-wholesale-order";
import { WHATSAPP_URL } from "@/lib/payment-details";
import { cn } from "@/lib/utils";
import {
  getAvailableCategories,
  getAvailableSizes,
  getColorName,
  getColorOptions,
  getEmojiOptions,
  getItemLabel,
  getLetterOptions,
} from "@/lib/wholesale/catalog-options";
import {
  CATEGORY_LABELS,
  CATEGORY_SINGULAR_LABELS,
  PLAIN_ITEM_KEY,
  REFERENCE_MIN_LENGTH,
  SIZE_FULL_LABELS,
  SIZE_SHORT_LABELS,
  WHOLESALE_CATEGORIES,
} from "@/lib/wholesale/constants";
import { sanitizeReference, type WholesaleMessageInput } from "@/lib/wholesale/build-whatsapp-message";
import { formatWholesaleArs } from "@/lib/wholesale/format";
import { findPriceRule } from "@/lib/wholesale/order-calculator";
import type { PublicWholesaleConfig, WholesaleCategory } from "@/types/wholesale";
import CategorySizeSelector from "./CategorySizeSelector";
import ColorPicker from "./ColorPicker";
import OrderActions from "./OrderActions";
import OrderSummary from "./OrderSummary";
import PlainProductQuantity from "./PlainProductQuantity";
import QuantityGrid from "./QuantityGrid";
import WholesaleUnavailable from "./WholesaleUnavailable";

interface WholesalePageProps {
  config: PublicWholesaleConfig;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function WholesalePage({ config }: WholesalePageProps) {
  const catalog = useRequiredCatalog();
  const order = useWholesaleOrder({ catalog, config });
  const { selection, evaluation, lines } = order;

  const categories = useMemo(() => getAvailableCategories(config), [config]);

  const unitsByCategory = useMemo(() => {
    const totals = Object.fromEntries(
      WHOLESALE_CATEGORIES.map((category) => [category, 0])
    ) as Record<WholesaleCategory, number>;
    for (const group of evaluation.groups) totals[group.category] += group.units;
    return totals;
  }, [evaluation.groups]);

  const messageInput = useMemo<WholesaleMessageInput>(
    () => ({
      reference: order.reference,
      notes: order.notes,
      lines,
      evaluation,
      resolveColorName: (category, colorHex) => getColorName(catalog, category, colorHex),
      resolveItemLabel: (category, itemKey) => getItemLabel(catalog, category, itemKey),
    }),
    [order.reference, order.notes, lines, evaluation, catalog]
  );

  if (!selection || categories.length === 0) {
    return <WholesaleUnavailable reason="empty" />;
  }

  const { category, size, colorHex } = selection;
  const rule = findPriceRule(config.priceRules, category, size);
  const colors = getColorOptions(catalog, category);
  const colorName = getColorName(catalog, category, colorHex);
  const isPlainProduct = category === "COLLAR" || category === "LEASH";

  const selectedGroupLines = lines.filter(
    (line) =>
      line.category === category &&
      line.size === size &&
      line.colorHex.toUpperCase() === colorHex.toUpperCase()
  );
  const quantities = Object.fromEntries(
    selectedGroupLines.map((line) => [line.itemKey, line.quantity])
  );
  const unitsInSelectedColor = selectedGroupLines.reduce((sum, line) => sum + line.quantity, 0);

  const unitsByColor: Record<string, number> = {};
  for (const group of evaluation.groups) {
    if (group.category === category && group.size === size) {
      unitsByColor[group.colorHex.toUpperCase()] = group.units;
    }
  }

  const items =
    category === "LETTER"
      ? getLetterOptions(catalog, colorHex)
      : category === "EMOJI"
        ? getEmojiOptions(catalog, size, colorHex)
        : [];

  const selectionLabel = `${colorName} · ${SIZE_SHORT_LABELS[size]} · ${CATEGORY_LABELS[category]}${category === "LETTER" ? " A–Z" : ""}`;

  const referenceLength = sanitizeReference(order.reference).length;
  const referenceError =
    referenceLength < REFERENCE_MIN_LENGTH
      ? `Ingresá una referencia de al menos ${REFERENCE_MIN_LENGTH} caracteres`
      : null;
  const canSend = evaluation.isValid && !referenceError;
  const pendingReasons = [...evaluation.blockingReasons, ...(referenceError ? [referenceError] : [])];

  const headerRequirement = evaluation.unitsRequirement
    ? `Mín. ${evaluation.unitsRequirement.required} u`
    : evaluation.amountRequirement
      ? `Mín. ${formatWholesaleArs(evaluation.amountRequirement.required)}`
      : null;

  function setItemQuantity(itemKey: string, quantity: number) {
    order.setQuantity({ category, size, colorHex, itemKey }, quantity);
  }

  return (
    <div className="min-h-screen bg-zinc-100 pb-28 lg:pb-0">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Volver al inicio" className="shrink-0">
              <Image
                src="/images/tikkiguau-logo.webp"
                alt="TikkiGuau"
                width={140}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <div className="sm:border-l sm:border-zinc-200 sm:pl-4">
              <h1 className="sr-only text-base font-bold text-zinc-900 sm:not-sr-only">
                Pedidos mayoristas
              </h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Letras, emojis, collares y correas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
              {headerRequirement}
              <span
                className={cn(
                  "rounded-full bg-zinc-900 px-2 py-0.5 text-white tabular-nums",
                  headerRequirement && "ml-2"
                )}
                aria-label={`${evaluation.totalUnits} unidades cargadas`}
              >
                {evaluation.totalUnits} u
              </span>
            </span>
            <Link
              href="/"
              className="hidden items-center gap-1 text-sm font-medium text-zinc-500 hover:text-[#C70F11] sm:flex"
            >
              <ArrowLeftIcon className="size-4" aria-hidden /> Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="flex min-w-0 flex-col gap-6">
          <CategorySizeSelector
            categories={categories}
            sizes={getAvailableSizes(config, category)}
            selectedCategory={category}
            selectedSize={size}
            onSelectCategory={order.selectCategory}
            onSelectSize={order.selectSize}
            unitsByCategory={unitsByCategory}
          />

          <ColorPicker
            colors={colors}
            selectedColorHex={colorHex}
            onSelectColor={order.selectColor}
            unitsByColor={unitsByColor}
            selectionLabel={selectionLabel}
            minUnitsPerColor={rule?.minUnitsPerColor ?? 0}
            unitsInSelectedColor={unitsInSelectedColor}
          />

          <section className="flex flex-col gap-3" aria-labelledby="wholesale-step-quantities">
            <h2
              id="wholesale-step-quantities"
              className="text-xs font-bold uppercase tracking-widest text-zinc-500"
            >
              2 · Cargá las cantidades
            </h2>

            {isPlainProduct ? (
              <PlainProductQuantity
                productLabel={capitalize(CATEGORY_SINGULAR_LABELS[category])}
                sizeLabel={SIZE_FULL_LABELS[size]}
                colorName={colorName}
                colorHex={colorHex}
                unitPriceArs={rule?.unitPriceArs ?? 0}
                quantity={quantities[PLAIN_ITEM_KEY] ?? 0}
                onChangeQuantity={(quantity) => setItemQuantity(PLAIN_ITEM_KEY, quantity)}
              />
            ) : (
              <QuantityGrid
                category={category}
                items={items}
                colorHex={colorHex}
                quantities={quantities}
                onChangeQuantity={setItemQuantity}
              />
            )}
          </section>
        </div>

        <div id="wholesale-summary" className="lg:sticky lg:top-6 lg:self-start">
          <OrderSummary
            evaluation={evaluation}
            lines={lines}
            resolveItemLabel={(summaryCategory, itemKey) =>
              getItemLabel(catalog, summaryCategory, itemKey)
            }
            reference={order.reference}
            notes={order.notes}
            referenceError={referenceError}
            resolveColorName={(summaryCategory, summaryColorHex) =>
              getColorName(catalog, summaryCategory, summaryColorHex)
            }
            onChangeReference={order.setReference}
            onChangeNotes={order.setNotes}
            onRemoveGroup={order.removeGroup}
            onClearOrder={order.clearOrder}
          >
            <OrderActions
              messageInput={messageInput}
              canSend={canSend}
              pendingReasons={pendingReasons}
              onStartNewOrder={order.clearOrder}
            />
          </OrderSummary>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-center text-xs text-zinc-500 sm:px-6 lg:px-8">
        Pedido por mayor TikkiGuau · Los precios son estimados, sin envío, y se confirman por{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2 hover:text-[#C70F11]"
        >
          WhatsApp
        </a>
        .
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold tabular-nums text-zinc-900">
              {evaluation.totalUnits} u
              {evaluation.totalUnits > 0 && ` · ${formatWholesaleArs(evaluation.totalAmountArs)}`}
            </p>
            <p className="text-xs text-zinc-500">
              {canSend ? "Listo para enviar" : (pendingReasons[0] ?? "Armá tu pedido")}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("wholesale-summary")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="rounded-lg bg-[#C70F11] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a50d0f]"
          >
            Ver pedido
          </button>
        </div>
      </div>
    </div>
  );
}
