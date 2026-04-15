import { getStudents } from '@/app/actions';
import AdvancedToolsClient from './AdvancedToolsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gelişmiş Araçlar | LGS Takip',
  description: 'Akıllı performans analizleri ve hedef takip araçları.',
};

export default async function AdvancedPage() {
  const students = await getStudents();

  return <AdvancedToolsClient students={students} />;
}
