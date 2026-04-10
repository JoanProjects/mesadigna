import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { kitchenService } from '../services/kitchen.service';
import type { DietarySummary } from '../types/kitchen.types';

export default function KitchenDietarySummaryPage() {
  usePageTitle('Cocina - Resumen dietario');
  const [summary, setSummary] = useState<DietarySummary | null>(null);
  const [loading, setLoading] = useState(true);

  }, []);


  return (
    <>
                    </div>
          </div>
      )}
    </>
  );
}
