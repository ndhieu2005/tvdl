'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
// import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  // Check if current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDebugRoute = pathname?.startsWith('/test-') || pathname?.startsWith('/admin-direct');

  // For admin routes, render without header/footer
  if (isAdminRoute || isDebugRoute) {
    return <>{children}</>;
  }

  // For home page, render without header
  if (isHomePage) {
    return (
      children
    );
  }

  // For modern UI of Duonglieu Library, render without footer
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );

  // For regular routes, render with header/footer
  // return (
  //   <div className="min-h-screen bg-gray-50 flex flex-col">
  //     <Header />
  //     <main className="flex-1">
  //       {children}
  //     </main>
  //     <Footer />
  //   </div>
  // );
}