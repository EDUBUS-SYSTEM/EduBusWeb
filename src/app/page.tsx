"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingView from "@/components/landing/LandingView";
import { schoolService } from "@/services/schoolService/schoolService.api";
import { SchoolDto } from "@/services/schoolService/schoolService.types";

export default function HomePage() {
  const router = useRouter();
  const [school, setSchool] = useState<SchoolDto | null>(null);
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setIsLoadingSchool(true);
        const data = await schoolService.get();
        setSchool(data);
        setLoadError(null);
      } catch (error) {
        console.error("[Homepage] Failed to load school info:", error);
        setLoadError("Không thể tải thông tin trường, hiển thị dữ liệu mặc định.");
      } finally {
        setIsLoadingSchool(false);
      }
    };

    fetchSchool();
  }, []);

  return (
    <LandingView
      school={school}
      isLoadingSchool={isLoadingSchool}
      loadError={loadError}
      onStartClick={() => router.push("/start")}
    />
  );
}


