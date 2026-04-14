'use client';

import { useEffect, useState } from 'react';
import { LocalStorageService } from '@/lib/services/localStorage.service';
import { MOCK_UNITS, MOCK_PEOPLE } from '@/lib/constants/directory.mocks';
import { Loader2 } from 'lucide-react';

/**
 * DemoDataProvider
 *
 * Este provider inicializa localStorage con los datos de los mocks
 * cuando NEXT_PUBLIC_USE_MOCKS=true, permitiendo que los cambios
 * persistan durante la navegación sin necesidad de backend.
 */
export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Solo inicializar si estamos en modo mocks
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      // Pequeño delay para asegurar hidratación de React
      const timer = setTimeout(() => {
        LocalStorageService.initWithMocks(MOCK_UNITS, MOCK_PEOPLE);
        setInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setInitialized(true);
    }
  }, []);

  // Mostrar loader mientras inicializa en modo demo
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Inicializando datos de demostración...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
