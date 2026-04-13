import { getStudents } from '@/app/actions';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const students = await getStudents();
  
  return <SidebarClient initialStudents={students} />;
}
