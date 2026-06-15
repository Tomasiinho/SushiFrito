import { useCallback, useEffect, useState } from "react";

export type UseCartNoticeResult = {
  cartNotice: string | null;
  clearCartNotice: () => void;
  showProductAdded: (productName: string) => void;
};

export function useCartNotice(): UseCartNoticeResult {
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!cartNotice) {
      return;
    }

    const timer = setTimeout(() => {
      setCartNotice(null);
    }, 2600);

    return () => {
      clearTimeout(timer);
    };
  }, [cartNotice]);

  const clearCartNotice = useCallback((): void => {
    setCartNotice(null);
  }, []);

  const showProductAdded = useCallback((productName: string): void => {
    setCartNotice(`${productName} agregado al carrito`);
  }, []);

  return { cartNotice, clearCartNotice, showProductAdded };
}
