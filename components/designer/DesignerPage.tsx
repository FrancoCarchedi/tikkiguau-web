"use client";

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import Stepper from '@/components/designer/Stepper';
import ProductStep from '@/components/designer/steps/ProductStep';
import CollarColorStep from '@/components/designer/steps/CollarColorStep';
import LeashColorStep from '@/components/designer/steps/LeashColorStep';
import ElementEditor from '@/components/designer/steps/ElementEditor';
import CartStep from '@/components/designer/steps/CartStep';
import UserDataStep from '@/components/designer/steps/UserDataStep';
import DeliveryStep from '@/components/designer/steps/DeliveryStep';
import ConfirmationStep from '@/components/designer/steps/ConfirmationStep';
import CollarPreview from '@/components/designer/CollarPreview';
import LeashPreview from '@/components/designer/LeashPreview';
import {
  getDefaultBaseColor,
  getShippingAmount,
  filterElementsForSize,
} from '@/lib/catalog/catalog-helpers';
import {
  buildOrderItems,
  calculateProductsTotal,
} from '@/lib/orders/build-order-items';
import { calculateOrderTotals } from '@/lib/orders/payment-pricing';
import {
  validateDeliveryData,
  validateUserData,
} from '@/lib/designer/validation';
import type {
  CartItem,
  CollarDesign,
  CollarElement,
  CollarSize,
  DeliveryData,
  LeashDesign,
  LeashSize,
  ProductType,
  UserData,
} from '@/types/collar';
import {
  MAX_COLLAR_ELEMENTS,
  MIN_COLLAR_ELEMENTS,
  MAX_LEASH_ELEMENTS,
  MIN_LEASH_ELEMENTS,
} from '@/types/collar';
import type { DesignerPaymentMethod } from '@/components/designer/steps/ConfirmationStep';

type StepKey =
  | 'product'
  | 'collar-color'
  | 'collar-design'
  | 'leash-color'
  | 'leash-design'
  | 'cart'
  | 'user-data'
  | 'delivery'
  | 'confirmation';

const STEP_LABELS: Record<StepKey, string> = {
  product: 'Producto',
  'collar-color': 'Color collar',
  'collar-design': 'Diseño collar',
  'leash-color': 'Color correa',
  'leash-design': 'Diseño correa',
  cart: 'Carrito',
  'user-data': 'Datos',
  delivery: 'Entrega',
  confirmation: 'Confirmar',
};

const FLOWS: Record<ProductType, StepKey[]> = {
  collar: [
    'product',
    'collar-color',
    'collar-design',
    'cart',
    'user-data',
    'delivery',
    'confirmation',
  ],
  leash: [
    'product',
    'leash-color',
    'leash-design',
    'cart',
    'user-data',
    'delivery',
    'confirmation',
  ],
  both: [
    'product',
    'collar-color',
    'collar-design',
    'leash-color',
    'leash-design',
    'cart',
    'user-data',
    'delivery',
    'confirmation',
  ],
};

function createInitialCollar(defaultColor: string): CollarDesign {
  return {
    collarColor: defaultColor,
    collarSize: '1',
    elements: [],
  };
}

function createInitialLeash(defaultColor: string): LeashDesign {
  return {
    leashColor: defaultColor,
    leashSize: '1',
    elements: [],
  };
}

type DesignerPageProps = {
  mercadoPagoEnabled?: boolean;
  mpPublicKey?: string | null;
};

export default function DesignerPage({
  mercadoPagoEnabled = false,
  mpPublicKey = null,
}: DesignerPageProps) {
  const catalog = useRequiredCatalog();
  const defaultColor = getDefaultBaseColor(catalog);

  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [design, setDesign] = useState<CollarDesign>(() => createInitialCollar(defaultColor));
  const [leashDesign, setLeashDesign] = useState<LeashDesign>(() =>
    createInitialLeash(defaultColor)
  );
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
  });
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({ method: 'PICKUP' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<DesignerPaymentMethod>('TRANSFER');
  const [paidTotalAmount, setPaidTotalAmount] = useState<number | null>(null);
  const [paidSurchargeAmount, setPaidSurchargeAmount] = useState<number | null>(
    null
  );
  const [collarSelectedId, setCollarSelectedId] = useState<string | null>(null);
  const [leashSelectedId, setLeashSelectedId] = useState<string | null>(null);
  const [forceFormErrors, setForceFormErrors] = useState(false);

  const currentFlow: StepKey[] = productType ? FLOWS[productType] : ['product'];
  const totalSteps = currentFlow.length;
  const currentStepKey: StepKey = currentFlow[step - 1] ?? 'product';
  const stepperSteps = useMemo(
    () => currentFlow.map((key) => ({ label: STEP_LABELS[key] })),
    [currentFlow]
  );

  const currentItem: CartItem = {
    id: 'current',
    productType: productType ?? 'collar',
    collarDesign:
      productType === 'collar' || productType === 'both' ? design : undefined,
    leashDesign:
      productType === 'leash' || productType === 'both' ? leashDesign : undefined,
  };

  const allItems: CartItem[] = [...savedItems, currentItem];

  const addCollarElement = useCallback((element: Omit<CollarElement, 'id'>) => {
    setDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, { ...element, id: crypto.randomUUID() }],
    }));
  }, []);

  const removeCollarElement = useCallback((id: string) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.filter((element) => element.id !== id),
    }));
  }, []);

  const changeCollarColor = useCallback((id: string, color: string) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((element) =>
        element.id === id ? { ...element, color } : element
      ),
    }));
  }, []);

  const reorderCollarElements = useCallback((elements: CollarElement[]) => {
    setDesign((prev) => ({ ...prev, elements }));
  }, []);

  const clearCollarElements = useCallback(() => {
    setDesign((prev) => ({ ...prev, elements: [] }));
  }, []);

  const addLeashElement = useCallback((element: Omit<CollarElement, 'id'>) => {
    setLeashDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, { ...element, id: crypto.randomUUID() }],
    }));
  }, []);

  const removeLeashElement = useCallback((id: string) => {
    setLeashDesign((prev) => ({
      ...prev,
      elements: prev.elements.filter((element) => element.id !== id),
    }));
  }, []);

  const changeLeashElementColor = useCallback((id: string, color: string) => {
    setLeashDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((element) =>
        element.id === id ? { ...element, color } : element
      ),
    }));
  }, []);

  const reorderLeashElements = useCallback((elements: CollarElement[]) => {
    setLeashDesign((prev) => ({ ...prev, elements }));
  }, []);

  const clearLeashElements = useCallback(() => {
    setLeashDesign((prev) => ({ ...prev, elements: [] }));
  }, []);

  const handleAddAnotherProduct = useCallback(() => {
    const savedItem: CartItem = {
      id: crypto.randomUUID(),
      productType: productType!,
      collarDesign:
        productType === 'collar' || productType === 'both'
          ? { ...design, elements: [...design.elements] }
          : undefined,
      leashDesign:
        productType === 'leash' || productType === 'both'
          ? { ...leashDesign, elements: [...leashDesign.elements] }
          : undefined,
    };

    setSavedItems((prev) => [...prev, savedItem]);
    setProductType(null);
    setDesign(createInitialCollar(defaultColor));
    setLeashDesign(createInitialLeash(defaultColor));
    setStep(1);
  }, [productType, design, leashDesign, defaultColor]);

  const canProceed = () => {
    if (currentStepKey === 'product') return productType !== null;
    if (currentStepKey === 'collar-design') {
      return design.elements.length >= MIN_COLLAR_ELEMENTS;
    }
    if (currentStepKey === 'leash-design') {
      return leashDesign.elements.length >= MIN_LEASH_ELEMENTS;
    }
    if (currentStepKey === 'user-data') {
      return validateUserData(userData).success;
    }
    if (currentStepKey === 'delivery') {
      return validateDeliveryData(deliveryData).success;
    }
    return true;
  };

  const handleNext = () => {
    const isFormStep =
      currentStepKey === 'user-data' || currentStepKey === 'delivery';

    if (!canProceed()) {
      if (isFormStep) setForceFormErrors(true);
      return;
    }

    setForceFormErrors(false);
    setStep((current) => current + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const productsTotal = calculateProductsTotal(catalog, allItems);
      const shippingAmount = getShippingAmount(catalog, deliveryData.method);
      const totals = calculateOrderTotals({
        productsAmount: productsTotal,
        shippingAmount,
        paymentMethod,
      });
      const orderItems = buildOrderItems(catalog, allItems);

      const address =
        deliveryData.method === 'CORREO_DOMICILIO'
          ? deliveryData.address
          : deliveryData.method === 'CORREO_SUCURSAL'
            ? deliveryData.branchPreference
            : undefined;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: userData.name.trim(),
          lastName: userData.lastName.trim(),
          email: userData.email.trim(),
          phone: userData.phone.trim(),
          dni: userData.dni.replace(/\D/g, ''),
          deliveryMethod: deliveryData.method,
          address,
          city: deliveryData.city,
          province: deliveryData.province,
          zipCode: deliveryData.postalCode,
          orderItems,
          totalAmount: totals.totalAmount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? 'Error al crear la orden');
      }

      const order = (await response.json()) as {
        orderNumber: string;
        preferenceId?: string | null;
        totalAmount?: number;
        paymentSurchargeAmount?: number;
      };
      setOrderNumber(order.orderNumber);
      setPreferenceId(order.preferenceId ?? null);
      setPaidTotalAmount(order.totalAmount ?? totals.totalAmount);
      setPaidSurchargeAmount(
        order.paymentSurchargeAmount ?? totals.paymentSurchargeAmount
      );
      setIsSubmitted(true);
      toast.success(
        paymentMethod === 'MERCADOPAGO'
          ? '¡Reserva creada! Completá el pago'
          : '¡Reserva confirmada!'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo confirmar la reserva. Intentá de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextButtonLabel =
    currentStepKey === 'cart'
      ? 'Continuar con tus datos'
      : currentStepKey === 'delivery'
        ? 'Revisar pedido'
        : 'Siguiente';

  return (
    <div className="designer-theme min-h-screen bg-[#D20A0A] flex items-start justify-center py-2 px-3 sm:py-8 sm:px-4">
      <div className="w-full max-w-6xl bg-white shadow-xl overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between py-5 px-4 sm:px-6 border-b border-gray-100">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Inicio
          </Link>
          <Image
            src="/images/tikkiguau-logo.webp"
            alt="TikkiGuau"
            width={200}
            height={56}
            className="h-14 w-auto"
            priority
          />
          <div className="w-14" aria-hidden />
        </div>

        <main className="px-3 py-5 sm:px-4 sm:py-6">
          <Stepper steps={stepperSteps} currentStep={step} />

          {currentStepKey === 'product' && (
            <ProductStep selectedProduct={productType} onSelect={setProductType} />
          )}

          {currentStepKey === 'collar-color' && (
            <div className="space-y-8">
              <CollarColorStep
                selectedColor={design.collarColor}
                selectedSize={design.collarSize}
                neckLengthCm={design.neckLengthCm}
                onSelectColor={(color) =>
                  setDesign((prev) => ({ ...prev, collarColor: color }))
                }
                onSelectSize={(size: CollarSize) => {
                  setDesign((prev) => ({
                    ...prev,
                    collarSize: size,
                    elements: filterElementsForSize(catalog, prev.elements, size),
                  }));
                  if (productType === 'both') {
                    setLeashDesign((prev) => ({
                      ...prev,
                      leashSize: size as LeashSize,
                      elements: filterElementsForSize(catalog, prev.elements, size),
                    }));
                  }
                }}
                onNeckLengthChange={(neckLengthCm) =>
                  setDesign((prev) => ({ ...prev, neckLengthCm }))
                }
              />
              <div className="max-w-lg mx-auto">
                <CollarPreview collarColor={design.collarColor} elements={[]} />
              </div>
            </div>
          )}

          {currentStepKey === 'collar-design' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ElementEditor
                elements={design.elements}
                onAddElement={addCollarElement}
                onRemoveElement={removeCollarElement}
                onChangeColor={changeCollarColor}
                onReorder={reorderCollarElements}
                onClear={clearCollarElements}
                maxElements={MAX_COLLAR_ELEMENTS}
                minElements={MIN_COLLAR_ELEMENTS}
                mode="collar"
                size={design.collarSize}
                title="Personalizá tu collar"
                selectedElementId={collarSelectedId}
                onSelectElement={setCollarSelectedId}
              />
              <div className="lg:sticky lg:top-28 lg:self-start">
                <CollarPreview
                  collarColor={design.collarColor}
                  elements={design.elements}
                  onChangeColor={changeCollarColor}
                  onReorder={reorderCollarElements}
                  onRemoveElement={removeCollarElement}
                  selectedElementId={collarSelectedId}
                  onSelectElement={setCollarSelectedId}
                />
              </div>
            </div>
          )}

          {currentStepKey === 'leash-color' && (
            <div className="space-y-8">
              <LeashColorStep
                selectedColor={leashDesign.leashColor}
                onSelectColor={(color) =>
                  setLeashDesign((prev) => ({ ...prev, leashColor: color }))
                }
                {...(productType === 'leash'
                  ? {
                      selectedSize: leashDesign.leashSize,
                      onSelectSize: (size: LeashSize) =>
                        setLeashDesign((prev) => ({
                          ...prev,
                          leashSize: size,
                          elements: filterElementsForSize(catalog, prev.elements, size),
                        })),
                    }
                  : {})}
              />
              <div className="max-w-lg mx-auto">
                <LeashPreview
                  leashColor={leashDesign.leashColor}
                  elements={leashDesign.elements}
                />
              </div>
            </div>
          )}

          {currentStepKey === 'leash-design' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ElementEditor
                elements={leashDesign.elements}
                onAddElement={addLeashElement}
                onRemoveElement={removeLeashElement}
                onChangeColor={changeLeashElementColor}
                onReorder={reorderLeashElements}
                onClear={clearLeashElements}
                maxElements={MAX_LEASH_ELEMENTS}
                minElements={MIN_LEASH_ELEMENTS}
                mode="leash"
                size={leashDesign.leashSize}
                title="Personalizá tu correa"
                subtitle={`Agregá letras y emojis (${leashDesign.elements.length}/${MAX_LEASH_ELEMENTS}, mínimo ${MIN_LEASH_ELEMENTS})`}
                selectedElementId={leashSelectedId}
                onSelectElement={setLeashSelectedId}
              />
              <div className="lg:sticky lg:top-28 lg:self-start">
                <LeashPreview
                  leashColor={leashDesign.leashColor}
                  elements={leashDesign.elements}
                />
              </div>
            </div>
          )}

          {currentStepKey === 'cart' && (
            <CartStep items={allItems} onAddAnother={handleAddAnotherProduct} />
          )}

          {currentStepKey === 'user-data' && (
            <UserDataStep
              data={userData}
              onChange={setUserData}
              forceShowErrors={forceFormErrors}
            />
          )}

          {currentStepKey === 'delivery' && (
            <DeliveryStep
              data={deliveryData}
              onChange={setDeliveryData}
              forceShowErrors={forceFormErrors}
            />
          )}

          {currentStepKey === 'confirmation' && (
            <ConfirmationStep
              items={allItems}
              userData={userData}
              deliveryData={deliveryData}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              mercadoPagoEnabled={mercadoPagoEnabled}
              mpPublicKey={mpPublicKey}
              preferenceId={preferenceId}
              orderNumber={orderNumber}
              paidTotalAmount={paidTotalAmount}
              paidSurchargeAmount={paidSurchargeAmount}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isSubmitted={isSubmitted}
            />
          )}

          {!isSubmitted && (
            <div className="flex justify-between items-center mt-6 max-w-2xl mx-auto">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForceFormErrors(false);
                    setStep((current) => current - 1);
                  }}
                  className="rounded-xl h-10 px-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    currentStepKey !== 'user-data' &&
                    currentStepKey !== 'delivery' &&
                    !canProceed()
                  }
                  className="bg-primary text-primary-foreground rounded-xl font-semibold px-6 h-10"
                >
                  {nextButtonLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
