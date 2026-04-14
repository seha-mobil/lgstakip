import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function StudentLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string }
}) {
  const cookieStore = cookies();
  const auth = cookieStore.get(`student_auth_${params.id}`);

  // Skip auth for the login page itself to avoid infinite recursion
  // But wait, layout.tsx wraps its own children. In Next.js App Router, 
  // if login is a child of the layout, we need to be careful.
  // Actually, I'll put login OUTSIDE this layout or check the path.
  
  // Better: The layout will check if the student exists and if authorized.
  // If we are on the login page, we DON'T want to redirect.
  // However, layout.tsx applies to all children. 
  // I will check the headers to see the current URL.
  
  // In Next.js, we can't easily get the URL in a Server Component layout 
  // without some tricks, but we CAN check if the cookie exists.
  
  if (!auth) {
    // If no auth cookie, we should redirect.
    // BUT we must allow the login page to render.
    // I will use a simple approach: if this layout is active, 
    // and there's no auth, we redirect to login ONLY if we are not already there.
    // Wait, the Login page is a child of this layout?! 
    // No, if I put it in app/student/[id]/login/page.tsx, it IS a child.
    
    // Actually, I'll move the login page to app/student/[id]/login and 
    // keep the layout in app/student/[id]/protected_layout.tsx? No.
    
    // Alternative: Put the auth check INSIDE the page components, 
    // but a layout is cleaner. Let's use a workaround for the login page.
  }

  return <>{children}</>;
}
