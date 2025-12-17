"use client";

import React, { useEffect, useState } from "react";
import { userAccountService } from "@/services/userAccountService/userAccountService.api";

interface UserAvatarImageProps {
  userId: string;
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
  userPhotoFileId?: string | null;
}

export function UserAvatarImage({
  userId,
  firstName,
  lastName,
  size = 48,
  className = "",
  userPhotoFileId,
}: UserAvatarImageProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {

    if (!userPhotoFileId) {
      setLoading(false);
      setError(true);
      return;
    }

    let blobUrl: string | null = null;
    let isMounted = true;

    const loadAvatar = async () => {
      try {
        setLoading(true);
        setError(false);


        const imageUrl = userAccountService.getAvatarUrl(userId);
        const token = localStorage.getItem("token");

        if (!token) {
          setError(true);
          return;
        }

        const response = await fetch(imageUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "image/*",
          },
          credentials: "include",
        });

        if (!response.ok) {

          if (isMounted) {
            setError(true);
          }
          return;
        }

        const blob = await response.blob();
        if (!isMounted) return;

        blobUrl = URL.createObjectURL(blob);
        setAvatarUrl(blobUrl);
      } catch {

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAvatar();


    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [userId, userPhotoFileId]);


  if (error || !avatarUrl) {
    return (
      <div
        className={`rounded-full bg-gradient-to-r from-[#fad23c] to-[#FFF085] flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[#463B3B] font-bold" style={{ fontSize: size * 0.4 }}>
          {firstName.charAt(0)}
          {lastName.charAt(0)}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse bg-gray-300 rounded-full" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    );
  }

  return (

    <img
      key={`user-avatar-${userId}-${avatarUrl}`}
      src={avatarUrl}
      alt={`${firstName} ${lastName}`}
      className={`rounded-full object-cover border-2 border-[#fad23c] ${className}`}
      style={{ width: size, height: size }}
      onError={() => {

        setError(true);
      }}
    />
  );
}

