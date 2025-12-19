'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/start');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700]"></div>
    </div>
  );
}


