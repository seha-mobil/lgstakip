import { getStudents } from '@/app/actions';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  let students: any[] = [];
  try {
    students = await getStudents();
  } catch (error) {
    console.error('Sidebar: Failed to fetch students during build/render', error);
  }
  
  return <SidebarClient initialStudents={students} />;
}
