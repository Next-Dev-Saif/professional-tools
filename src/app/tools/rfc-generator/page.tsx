import { RFCGeneratorClient } from '@/components/page-sections/rfc-generator/RFCGeneratorClient';

export const metadata = {
  title: 'RFC Generator | Hephaestus Tools',
  description: 'Propose new features and architectures with a standardized Request for Comments document.',
};

export default function RFCGeneratorPage() {
  return <RFCGeneratorClient />;
}
