"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {

    if (prevPathnameRef.current !== pathname) {
      setIsLoading(true);
      prevPathnameRef.current = pathname;


      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200 overflow-hidden">
      <div className="h-full bg-[#fad23c] w-full animate-navigation-loading" />
    </div>
  );
}

