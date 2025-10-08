'use client';

import { useState } from 'react';
import { X, Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  isCover: boolean;
  alt?: string;
  order: number;
  createdAt: Date;
}

interface PhotosManagerModalProps {
  isOpen: boolean;
  propertyId: string;
  initialPhotos: Photo[];
  onUpdate: () => Promise<void>;
  onClose: () => void;
}

export default function PhotosManagerModal({
  isOpen,
  propertyId,
  initialPhotos,
  onUpdate,
  onClose,
}: PhotosManagerModalProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${apiUrl}/properties/${propertyId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }
      }

      // Refresh photos
      await onUpdate();
      
      // Get updated photos from parent
      setPhotos(initialPhotos);
      
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';

      const response = await fetch(`${apiUrl}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Refresh photos
      await onUpdate();
      setPhotos(photos.filter(p => p.id !== photoId));
      
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  const handleSetCover = async (photoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';

      const response = await fetch(`${apiUrl}/photos/${photoId}/cover`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to set cover photo');
      }

      // Update local state
      setPhotos(photos.map(p => ({
        ...p,
        isCover: p.id === photoId
      })));

      await onUpdate();
      
    } catch (err) {
      console.error('Error setting cover photo:', err);
      setError('Failed to set cover photo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Photos</h2>
            <p className="text-sm text-gray-500 mt-1">{photos.length} photos uploaded</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Upload Area */}
          <div className="mb-6">
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  {uploading ? 'Uploading...' : 'Click to upload photos'}
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop • JPG, PNG up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-colors"
                >
                  {/* Cover Badge */}
                  {photo.isCover && (
                    <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt={photo.alt || 'Property photo'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                    {!photo.isCover && (
                      <button
                        onClick={() => handleSetCover(photo.id)}
                        className="p-2 bg-white rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                        title="Set as cover"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

