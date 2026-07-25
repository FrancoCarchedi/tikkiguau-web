"use client";

import Link from 'next/link';
import { CheckCircle, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import CollarPreview from '@/components/designer/CollarPreview';
import LeashPreview from '@/components/designer/LeashPreview';
import { calculateProductsTotal } from '@/lib/orders/build-order-items';
import { findProductPrice, getShippingAmount } from '@/lib/catalog/catalog-helpers';
import { MERCADO_PAGO_PAYMENT, WHATSAPP_URL } from '@/lib/payment-details';
import { formatArsPrice } from '@/types/catalog';
import {
  COLLAR_SIZES,
  LEASH_SIZES,
  type CartItem,
  type DeliveryData,
  type UserData,
} from '@/types/collar';

interface ConfirmationStepProps {
  items: CartItem[];
  userData: UserData;
  deliveryData: DeliveryData;
  orderNumber: string | null;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

const DELIVERY_LABELS: Record<DeliveryData['method'], string> = {
  PICKUP: 'Retiro presencial',
  CORREO_SUCURSAL: 'Retiro por sucursal',
  CORREO_DOMICILIO: 'Envío a domicilio',
};

function getSizeLabel(sizeValue: string, sizes: { value: string; label: string }[]) {
  return sizes.find((size) => size.value === sizeValue)?.label ?? '';
}

export default function ConfirmationStep({
  items,
  userData,
  deliveryData,
  orderNumber,
  onSubmit,
  isSubmitting,
  isSubmitted,
}: ConfirmationStepProps) {
  const catalog = useRequiredCatalog();
  const productsTotal = calculateProductsTotal(catalog, items);
  const shippingAmount = getShippingAmount(catalog, deliveryData.method);
  const totalAmount = productsTotal + shippingAmount;

  if (isSubmitted && orderNumber) {
    return (
      <div className="text-center space-y-6 py-6 max-w-lg mx-auto">
        <CheckCircle className="w-16 h-16 text-accent mx-auto" />
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">
            ¡Reserva confirmada!
          </h2>
          <p className="text-muted-foreground">
            Tu número de orden es{' '}
            <span className="font-bold text-primary">{orderNumber}</span>
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 text-left space-y-4 shadow-card">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Realizá el pago por transferencia a nuestra cuenta de Mercado Pago. Una
            vez acreditado, comenzamos a confeccionar tu pedido.
          </p>
          <div className="grid gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                Alias
              </p>
              <p className="font-medium text-foreground">{MERCADO_PAGO_PAYMENT.alias}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                CVU
              </p>
              <p className="font-medium text-foreground font-mono">{MERCADO_PAGO_PAYMENT.cvu}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                Titular
              </p>
              <p className="font-medium text-foreground">{MERCADO_PAGO_PAYMENT.holder}</p>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-semibold text-foreground">
              <span>Total a transferir</span>
              <span className="text-primary">{formatArsPrice(totalAmount)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Incluye productos ({formatArsPrice(productsTotal)}) + envío (
            {shippingAmount === 0 ? 'sin costo' : formatArsPrice(shippingAmount)}
            ). Cuando hagas la transferencia, enviá el comprobante por WhatsApp e
            indicá tu número de orden <strong>{orderNumber}</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar comprobante por WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 h-10 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-left md:text-center">
        <h2 className="text-2xl font-semibold text-foreground">Confirmá tu pedido</h2>
        <p className="text-muted-foreground mt-1">Revisá el resumen antes de enviar la reserva</p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {items.map((item, index) => {
          const product = findProductPrice(catalog, item.productType);

          return (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="font-semibold text-foreground">{product?.label}</span>
                <span className="ml-auto text-primary font-bold text-sm">
                  {product ? formatArsPrice(product.amountArs) : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(item.productType === 'collar' || item.productType === 'both') &&
                  item.collarDesign && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                        Collar · {getSizeLabel(item.collarDesign.collarSize, COLLAR_SIZES)}
                      </h3>
                      <CollarPreview
                        collarColor={item.collarDesign.collarColor}
                        elements={item.collarDesign.elements}
                      />
                    </div>
                  )}
                {(item.productType === 'leash' || item.productType === 'both') &&
                  item.leashDesign && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                        Correa · {getSizeLabel(item.leashDesign.leashSize, LEASH_SIZES)}
                      </h3>
                      <LeashPreview
                        leashColor={item.leashDesign.leashColor}
                        elements={item.leashDesign.elements}
                      />
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="bg-card rounded-xl p-4 border border-border shadow-card space-y-2">
          <h3 className="font-semibold text-foreground border-b border-border pb-2">
            Datos de contacto
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Nombre:</span> {userData.name}{' '}
              {userData.lastName}
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span> {userData.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Teléfono:</span> {userData.phone}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-card space-y-2">
          <h3 className="font-semibold text-foreground border-b border-border pb-2">
            Entrega
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Método:</span>{' '}
              {DELIVERY_LABELS[deliveryData.method]}
            </p>
            {deliveryData.address && (
              <p>
                <span className="font-medium text-foreground">Dirección:</span>{' '}
                {deliveryData.address}
              </p>
            )}
            {deliveryData.branchPreference && (
              <p>
                <span className="font-medium text-foreground">Dirección de sucursal:</span>{' '}
                {deliveryData.branchPreference}
              </p>
            )}
            {deliveryData.city && (
              <p>
                <span className="font-medium text-foreground">Ciudad:</span> {deliveryData.city}
              </p>
            )}
            {deliveryData.postalCode && (
              <p>
                <span className="font-medium text-foreground">CP:</span> {deliveryData.postalCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border shadow-card space-y-2 max-w-sm mx-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Productos</span>
          <span className="font-medium text-foreground">{formatArsPrice(productsTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium text-foreground">
            {shippingAmount === 0 ? 'Sin costo' : formatArsPrice(shippingAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-bold text-foreground border-t border-border pt-2">
          <span>Total</span>
          <span className="text-primary">{formatArsPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl text-lg shadow-soft h-auto"
        >
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Confirmar reserva
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
