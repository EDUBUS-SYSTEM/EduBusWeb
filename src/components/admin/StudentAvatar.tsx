import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { studentService } from '@/services/studentService/studentService.api';

interface StudentAvatarProps {
    studentId: string;
    studentName: string;
    onUploadSuccess?: () => void;
}

export function StudentAvatar({ studentId, studentName, onUploadSuccess }: StudentAvatarProps) {
    const [uploading, setUploading] = useState(false);
    const [hasImage, setHasImage] = useState(false);
    const [imageKey, setImageKey] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const getInitials = (name: string): string => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(studentName);

    // Load avatar with authentication token
    useEffect(() => {
        let blobUrl: string | null = null;
        let isMounted = true;

        const loadAvatar = async () => {
            try {
                const imageUrl = `${studentService.getPhotoUrl(studentId)}?t=${imageKey}`;
                const token = localStorage.getItem("token");

                if (!token) {
                    if (isMounted) {
                        setHasImage(false);
                    }
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
                        setHasImage(false);
                    }
                    return;
                }

                const blob = await response.blob();
                if (!isMounted) return;

                blobUrl = URL.createObjectURL(blob);
                setAvatarUrl(blobUrl);
                setHasImage(true);
            } catch (err) {
                console.error("Error loading student avatar:", err);
                if (isMounted) {
                    setHasImage(false);
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
    }, [studentId, imageKey]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
            toast.error('Please upload a valid image file (jpg, jpeg, png)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must not exceed 2MB');
            return;
        }

        setUploading(true);
        try {
            await studentService.uploadPhoto(studentId, file);
            toast.success('Upload avatar student successfully');
            setImageKey(Date.now()); // Trigger reload of avatar
            onUploadSuccess?.();
        } catch (error: unknown) {
            console.error('Error uploading photo:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message 
                || (error as { message?: string })?.message 
                || 'Failed to upload photo';
            toast.error(`Failed to upload photo. Please try again: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                    <>
                        {!hasImage && (
                            <span className="text-white font-semibold text-base">
                                {initials}
                            </span>
                        )}
                        {avatarUrl && (
                            <img
                                key={`student-avatar-${studentId}-${imageKey}`}
                                src={avatarUrl}
                                alt={studentName}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </>
                )}
            </div>

            <label
                htmlFor={`avatar-upload-${studentId}`}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Upload photo"
            >
                <FaCamera className="w-4 h-4 text-white" />
            </label>

            <input
                id={`avatar-upload-${studentId}`}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
            />
        </div>
    );
}
