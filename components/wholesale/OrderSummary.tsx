"use client";

import { useState } from "react";
import { CheckCircle2Icon, PackageOpenIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  NOTES_MAX_LENGTH,
  PLAIN_ITEM_KEY,
  REFERENCE_MAX_LENGTH,
  SIZE_SHORT_LABELS,
} from "@/lib/wholesale/constants";
import { formatWholesaleArs } from "@/lib/wholesale/format";
import type {
  WholesaleCategory,
  WholesaleGroupEvaluation,
  WholesaleOrderEvaluation,
  WholesaleOrderLine,
  WholesaleRequirementProgress,
} from "@/types/wholesale";

function getGroupItemLines(
  lines: WholesaleOrderLine[],
  group: WholesaleGroupEvaluation
): WholesaleOrderLine[] {
  return lines.filter(
    (line) =>
      line.quantity > 0 &&
      line.category === group.category &&
      line.size === group.size &&
      line.colorHex.toUpperCase() === group.colorHex.toUpperCase() &&
      line.itemKey !== PLAIN_ITEM_KEY
  );
}

interface OrderSummaryProps {
  evaluation: WholesaleOrderEvaluation;
  lines: WholesaleOrderLine[];
  resolveItemLabel: (category: WholesaleCategory, itemKey: string) => string;
  reference: string;
  notes: string;
  referenceError: string | null;
  resolveColorName: (category: WholesaleCategory, colorHex: string) => string;
  onChangeReference: (reference: string) => void;
  onChangeNotes: (notes: string) => void;
  onRemoveGroup: (
    category: WholesaleCategory,
    size: WholesaleOrderEvaluation["groups"][number]["size"],
    colorHex: string
  ) => void;
  onClearOrder: () => void;
  children: React.ReactNode;
}

function RequirementRow({
  label,
  progress,
  formatValue,
}: {
  label: string;
  progress: WholesaleRequirementProgress;
  formatValue: (value: number) => string;
}) {
  const percentage = Math.min(100, Math.round((progress.current / progress.required) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600">{label}</span>
        <span className="tabular-nums text-zinc-500">
          {formatValue(progress.current)} / {formatValue(progress.required)}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.required}
        aria-valuenow={Math.min(progress.current, progress.required)}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-all", progress.isMet ? "bg-emerald-500" : "bg-[#C70F11]")}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={cn("text-xs", progress.isMet ? "text-emerald-700" : "text-[#C70F11]")}>
        {progress.isMet
          ? "Mínimo cumplido"
          : `Bajo mínimo · faltan ${formatValue(progress.missing)} para pedir`}
      </p>
    </div>
  );
}

export default function OrderSummary({
  evaluation,
  lines,
  resolveItemLabel,
  reference,
  notes,
  referenceError,
  resolveColorName,
  onChangeReference,
  onChangeNotes,
  onRemoveGroup,
  onClearOrder,
  children,
}: OrderSummaryProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const isEmpty = evaluation.totalUnits === 0;

  return (
    <aside
      aria-label="Tu pedido"
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Tu pedido</h2>
          <p className="text-3xl font-extrabold tabular-nums text-zinc-900">
            {evaluation.totalUnits}{" "}
            <span className="text-base font-semibold text-zinc-500">
              {evaluation.totalUnits === 1 ? "unidad" : "unidades"}
            </span>
          </p>
        </div>
        {!isEmpty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
            className="text-zinc-500"
          >
            <Trash2Icon className="mr-1 size-3.5" />
            Vaciar
          </Button>
        )}
      </div>

      {(evaluation.unitsRequirement || evaluation.amountRequirement) && (
        <div className="flex flex-col gap-3">
          {evaluation.unitsRequirement && (
            <RequirementRow
              label="Unidades mínimas del pedido"
              progress={evaluation.unitsRequirement}
              formatValue={(value) => `${value} u`}
            />
          )}
          {evaluation.amountRequirement && (
            <RequirementRow
              label="Monto mínimo del pedido"
              progress={evaluation.amountRequirement}
              formatValue={formatWholesaleArs}
            />
          )}
        </div>
      )}

      <div className="rounded-xl bg-zinc-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Precio estimado
        </p>
        <p className="text-2xl font-extrabold tabular-nums text-zinc-900">
          {isEmpty ? "—" : formatWholesaleArs(evaluation.totalAmountArs)}
        </p>
        <p className="text-xs text-zinc-500">Sin envío. Melizza confirma el valor final por WhatsApp.</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-6 text-center">
          <PackageOpenIcon className="size-8 text-zinc-400" aria-hidden />
          <p className="text-sm text-zinc-500">
            Todavía no cargaste nada. Elegí un color y sumá unidades.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {evaluation.groups.map((group) => {
            const isMinimumMet = group.missingUnits === 0;
            const itemLines = getGroupItemLines(lines, group);

            return (
              <li
                key={`${group.category}-${group.size}-${group.colorHex}`}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3"
              >
                <span
                  className="mt-0.5 block size-5 shrink-0 rounded-full border border-zinc-300"
                  style={{ backgroundColor: group.colorHex }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {CATEGORY_LABELS[group.category]} · {SIZE_SHORT_LABELS[group.size]} ·{" "}
                    {resolveColorName(group.category, group.colorHex)}
                  </p>
                  <p className="text-xs tabular-nums text-zinc-500">
                    {group.units} u · {formatWholesaleArs(group.subtotalArs)}
                  </p>
                  {itemLines.length > 0 && (
                    <ul
                      className="mt-1.5 flex flex-wrap gap-1"
                      aria-label="Detalle de unidades"
                    >
                      {itemLines.map((line) => (
                        <li
                          key={line.itemKey}
                          className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium tabular-nums text-zinc-700"
                        >
                          {resolveItemLabel(group.category, line.itemKey)} × {line.quantity}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs font-medium",
                      isMinimumMet ? "text-emerald-700" : "text-amber-700"
                    )}
                  >
                    {isMinimumMet ? (
                      <>
                        <CheckCircle2Icon className="size-3.5" aria-hidden /> Mínimo por color cumplido
                      </>
                    ) : (
                      `Faltan ${group.missingUnits} u (mín. ${group.minUnitsPerColor} por color)`
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveGroup(group.category, group.size, group.colorHex)}
                  className="text-xs font-medium text-zinc-400 underline-offset-2 hover:text-[#C70F11] hover:underline"
                  aria-label={`Quitar ${CATEGORY_LABELS[group.category]} ${SIZE_SHORT_LABELS[group.size]} ${resolveColorName(group.category, group.colorHex)}`}
                >
                  Quitar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="wholesale-reference"
            className="text-[11px] font-bold uppercase tracking-widest text-zinc-500"
          >
            Referencia del pedido
          </label>
          <Input
            id="wholesale-reference"
            value={reference}
            maxLength={REFERENCE_MAX_LENGTH}
            placeholder="Ej: Pedido junio — Melisa"
            aria-invalid={!!referenceError && reference.length > 0}
            onChange={(event) => onChangeReference(event.target.value)}
          />
          {referenceError && reference.length > 0 && (
            <p className="text-xs text-[#C70F11]">{referenceError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="wholesale-notes"
            className="text-[11px] font-bold uppercase tracking-widest text-zinc-500"
          >
            Notas (opcional)
          </label>
          <Textarea
            id="wholesale-notes"
            value={notes}
            maxLength={NOTES_MAX_LENGTH}
            rows={3}
            placeholder="Aclaraciones, fecha que lo necesitás, etc."
            onChange={(event) => onChangeNotes(event.target.value)}
          />
          <p className="text-right text-[11px] tabular-nums text-zinc-400">
            {notes.length} / {NOTES_MAX_LENGTH}
          </p>
        </div>
      </div>

      {children}

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Vaciar el pedido?</DialogTitle>
            <DialogDescription>
              Vas a perder todas las cantidades, la referencia y las notas cargadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsClearDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onClearOrder();
                setIsClearDialogOpen(false);
              }}
            >
              Vaciar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
