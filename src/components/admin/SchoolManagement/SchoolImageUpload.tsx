"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaUpload, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import { fileService, SchoolImageType } from "@/services/fileService/fileService.api";
import Image from "next/image";

interface SchoolImageUploadProps {
  schoolId: string;
  fileType: SchoolImageType;
  label?: string;
  currentImageUrl?: string;
  currentFileId?: string;
  galleryImages?: Array<{ fileId: string; imageUrl: string; originalFileName: string }>; 
  onUploadSuccess?: (fileId: string, imageUrl: string) => void;
  onDeleteSuccess?: () => void;
  multiple?: boolean; 
  maxImages?: number; 
}

interface GalleryImage {
  fileId: string;
  imageUrl: string;
  originalFileName: string;
}

export default function SchoolImageUpload({
  schoolId,
  fileType,
  label,
  currentImageUrl,
  currentFileId,
  galleryImages: initialGalleryImages = [],
  onUploadSuccess,
  onDeleteSuccess,
  multiple = false,
  maxImages = 10,
}: SchoolImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialGalleryImages);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [galleryBlobUrls, setGalleryBlobUrls] = useState<Map<string, string>>(new Map());
  const [galleryImageErrors, setGalleryImageErrors] = useState<Set<string>>(new Set());
  const [galleryImageLoading, setGalleryImageLoading] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryBlobUrlsRef = useRef<Map<string, string>>(new Map());

 
  useEffect(() => {
    let blobUrlToCleanup: string | null = null;

    const loadImageWithAuth = async (url: string) => {
      try {
        if (blobUrlToCleanup) {
          URL.revokeObjectURL(blobUrlToCleanup);
          blobUrlToCleanup = null;
        }

        if (url.startsWith('blob:') || url.startsWith('data:')) {
          setImageBlobUrl(url);
          return;
        }

        if (url.startsWith('/api/file/')) {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('[SchoolImageUpload] No token found in localStorage');
            setImageBlobUrl(null);
            return;
          }

          console.log(`[SchoolImageUpload] Fetching image from: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'image/*,*/*',
            },
            cache: 'no-store',
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`[SchoolImageUpload] Failed to load image: ${response.status} ${response.statusText}`);
            console.error(`[SchoolImageUpload] Error details: ${errorText}`);
            throw new Error(`Failed to load image: ${response.status} - ${errorText}`);
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobUrlToCleanup = blobUrl;
          setImageBlobUrl(blobUrl);
          console.log(`[SchoolImageUpload] Successfully loaded image, size: ${blob.size} bytes`);
        } else {
          setImageBlobUrl(url);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageBlobUrl(null);
      }
    };

    if (previewUrl) {
      loadImageWithAuth(previewUrl);
    } else {
      setImageBlobUrl(null);
    }

    return () => {
      if (blobUrlToCleanup) {
        URL.revokeObjectURL(blobUrlToCleanup);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  useEffect(() => {
    if (multiple) {
      setGalleryImages(initialGalleryImages);
    }
  }, [multiple, initialGalleryImages]);

  useEffect(() => {
    if (!multiple || galleryImages.length === 0) {
      setGalleryBlobUrls(new Map());
      setGalleryImageErrors(new Set());
      setGalleryImageLoading(new Set());
      return;
    }

    const cleanupUrls: string[] = [];
    let isMounted = true;

    const loadGalleryImages = async () => {
      const newBlobUrls = new Map<string, string>();
      const newErrors = new Set<string>();
      const loadingSet = new Set<string>();

      galleryImages.forEach(img => loadingSet.add(img.fileId));
      if (isMounted) {
        setGalleryImageLoading(new Set(loadingSet));
      }

      for (const image of galleryImages) {
        if (!isMounted) break; 
        
        try {
          if (image.imageUrl.startsWith('blob:') || image.imageUrl.startsWith('data:')) {
            newBlobUrls.set(image.fileId, image.imageUrl);
            loadingSet.delete(image.fileId);
            continue;
          }

          if (image.imageUrl.startsWith('/api/file/')) {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error(`[SchoolImageUpload] No token found for gallery image ${image.fileId}`);
              newErrors.add(image.fileId);
              loadingSet.delete(image.fileId);
              continue;
            }

            try {
              console.log(`[SchoolImageUpload] Fetching gallery image: ${image.imageUrl}`);
              
              const response = await fetch(image.imageUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'image/*,*/*',
                },
                cache: 'no-store',
              });

              if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error(`[SchoolImageUpload] Failed to load gallery image ${image.fileId}: ${response.status} ${response.statusText}`);
                console.error(`[SchoolImageUpload] Error details: ${errorText}`);
                newErrors.add(image.fileId);
                loadingSet.delete(image.fileId);
                continue;
              }

              const blob = await response.blob();
              if (blob.size === 0) {
                console.error(`[SchoolImageUpload] Empty blob received for gallery image ${image.fileId}`);
                newErrors.add(image.fileId);
                loadingSet.delete(image.fileId);
                continue;
              }

              const blobUrl = URL.createObjectURL(blob);
              newBlobUrls.set(image.fileId, blobUrl);
              cleanupUrls.push(blobUrl);
              newErrors.delete(image.fileId); 
              loadingSet.delete(image.fileId);
              console.log(`[SchoolImageUpload] Successfully loaded gallery image ${image.fileId}, size: ${blob.size} bytes`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error(`[SchoolImageUpload] Error loading gallery image ${image.fileId}:`, errorMessage);
              newErrors.add(image.fileId);
              loadingSet.delete(image.fileId);
              continue;
            }
          } else {
            newBlobUrls.set(image.fileId, image.imageUrl);
            loadingSet.delete(image.fileId);
          }
        } catch (error) {
          console.error(`Error loading gallery image ${image.fileId}:`, error);
          newErrors.add(image.fileId);
          loadingSet.delete(image.fileId);
        }
      }

      if (isMounted) {
        galleryBlobUrlsRef.current.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        galleryBlobUrlsRef.current = newBlobUrls;
        setGalleryBlobUrls(newBlobUrls);
        setGalleryImageErrors(newErrors);
        setGalleryImageLoading(new Set(loadingSet));
      } else {
        cleanupUrls.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };

    loadGalleryImages();

    return () => {
      isMounted = false;
      cleanupUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [multiple, galleryImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      const filesArray = Array.from(files).slice(0, maxImages - galleryImages.length);
      await uploadMultipleFiles(filesArray);
    } else {
      await uploadSingleFile(files[0]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadSingleFile = async (file: File) => {
    try {
      setUploading(true);
      const response = await fileService.upload(
        file,
        "School",
        fileType,
        schoolId
      );
      const imageUrl = fileService.getFileUrl(response.fileId);
      setPreviewUrl(imageUrl);
      onUploadSuccess?.(response.fileId, imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to upload image";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[]) => {
    try {
      setUploading(true);
      const uploadPromises = files.map((file) =>
        fileService.upload(file, "School", fileType, schoolId)
      );
      const responses = await Promise.all(uploadPromises);
      
      onUploadSuccess?.(responses[0].fileId, fileService.getFileUrl(responses[0].fileId));
    } catch (error) {
      console.error("Error uploading files:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to upload images";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId?: string) => {
    if (!fileId && !currentFileId) return;
    
    const fileIdToDelete = fileId || currentFileId!;
    
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      setDeleting(true);
      await fileService.delete(fileIdToDelete);
      
      if (multiple && fileId) {
        setGalleryImages((prev) => prev.filter((img) => img.fileId !== fileId));
      } else {
        setPreviewUrl(null);
      }
      
      onDeleteSuccess?.();
    } catch (error) {
      console.error("Error deleting file:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete image";
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    
    if (files.length === 0) return;

    if (multiple) {
      await uploadMultipleFiles(files.slice(0, maxImages - galleryImages.length));
    } else {
      await uploadSingleFile(files[0]);
    }
  };

  const displayLabel = label || fileType;
  const isGallery = multiple || fileType === "Gallery";
  const isLogo = fileType === "Logo";
  const isWideImage = fileType === "Banner" || fileType === "StayConnected" || fileType === "FeatureHighlight";

  if (isGallery) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-800">
            {displayLabel}
          </label>
          <span className="text-xs text-gray-500">
            {galleryImages.length}/{maxImages} images
          </span>
        </div>
        
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryImages.map((image) => {
              const blobUrl = galleryBlobUrls.get(image.fileId);
              const isLoading = galleryImageLoading.has(image.fileId);
              const hasError = galleryImageErrors.has(image.fileId);
              
              return (
                <div key={image.fileId} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-[#fad23c] group-hover:scale-105">
                    {isLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FaSpinner className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    ) : hasError || !blobUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-3">
                        <FaImage className="w-6 h-6 text-gray-300 mb-1" />
                        <p className="text-xs text-gray-400 text-center">Failed to load</p>
                      </div>
                    ) : blobUrl.startsWith('blob:') || blobUrl.startsWith('data:') ? (
                      <img
                        src={blobUrl}
                        alt={image.originalFileName || fileType}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Error loading gallery image:', blobUrl);
                          setGalleryImageErrors(prev => new Set(prev).add(image.fileId));
                        }}
                      />
                    ) : (
                      <Image
                        src={blobUrl}
                        alt={image.originalFileName || fileType}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                        onError={(e) => {
                          console.error('Error loading gallery image:', blobUrl);
                          setGalleryImageErrors(prev => new Set(prev).add(image.fileId));
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <button
                    onClick={() => handleDelete(image.fileId)}
                    disabled={deleting}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 disabled:opacity-50 shadow-lg hover:scale-110"
                    title="Delete image"
                  >
                    {deleting ? (
                      <FaSpinner className="w-3 h-3 animate-spin" />
                    ) : (
                      <FaTrash className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}
            
            {galleryImages.length < maxImages && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#fad23c] hover:bg-gradient-to-br hover:from-[#FEFCE8] hover:to-[#FEF9C3] transition-all duration-300 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploading ? (
                  <FaSpinner className="w-8 h-8 text-[#fad23c] animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-[#fad23c]/20 rounded-full flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform">
                      <FaUpload className="w-5 h-5 text-[#fad23c]" />
                    </div>
                    <span className="text-xs text-gray-600 text-center px-2 font-medium">
                      Add
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {galleryImages.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#fad23c] hover:bg-gradient-to-br hover:from-[#FEFCE8] hover:to-[#FEF9C3] transition-all duration-300 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <FaSpinner className="w-12 h-12 text-[#fad23c] animate-spin mb-3" />
                <p className="text-gray-700 font-medium">Uploading images...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-16 h-16 bg-[#fad23c]/20 rounded-full flex items-center justify-center mx-auto">
                    <FaImage className="w-8 h-8 text-[#fad23c]" />
                  </div>
                </div>
                <p className="text-gray-700 font-semibold mb-2">
                  Click or drag images here to upload
                </p>
                <p className="text-sm text-gray-500">
                  You can upload up to {maxImages} images
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-800 mb-3">
        {displayLabel}
      </label>
      
      {previewUrl && imageBlobUrl ? (
        <div className="relative group">
          <div className={`relative w-full rounded-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-[#fad23c] ${
            isLogo
              ? "aspect-square min-h-[200px]"
              : isWideImage
              ? "aspect-video min-h-[250px]"
              : "min-h-[250px]"
          }`}>
            {imageBlobUrl.startsWith('blob:') || imageBlobUrl.startsWith('data:') ? (
              <img
                src={imageBlobUrl}
                alt={fileType}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error('Error loading image:', imageBlobUrl);
                  setPreviewUrl(null);
                  setImageBlobUrl(null);
                }}
              />
            ) : (
              <Image
                src={imageBlobUrl}
                alt={fileType}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                unoptimized
                onError={(e) => {
                  console.error('Error loading image:', imageBlobUrl);
                  setPreviewUrl(null);
                  setImageBlobUrl(null);
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          </div>
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="bg-blue-500 text-white p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 shadow-lg hover:scale-110"
              title="Replace image"
            >
              <FaUpload className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-500 text-white p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 disabled:opacity-50 shadow-lg hover:scale-110"
              title="Delete image"
            >
              {deleting ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaTrash className="w-4 h-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#fad23c] hover:bg-gradient-to-br hover:from-[#FEFCE8] hover:to-[#FEF9C3] transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center bg-gray-50 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="w-12 h-12 text-[#fad23c] animate-spin mb-3" />
              <p className="text-gray-700 font-medium">Uploading image...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 bg-[#fad23c]/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <FaImage className="w-8 h-8 text-[#fad23c]" />
                </div>
              </div>
              <p className="text-gray-700 font-semibold mb-1.5">
                Click or drag to upload
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {isLogo ? "Square image (1:1)" : (isWideImage ? "Wide image (16:9)" : "Any format")}
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

