import { InvoiceGeneratorClient } from '@/components/page-sections/invoice-generator/InvoiceGeneratorClient';

export const metadata = {
  title: 'Invoice Generator | Hephaestus Tools',
  description: 'Create professional, print-ready invoices with dynamic 3D templates.',
};

export default function InvoiceGeneratorPage() {
  return (
    <div className="min-h-full">
      <InvoiceGeneratorClient />
    </div>
  );
}
