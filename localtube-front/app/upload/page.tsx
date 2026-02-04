'use client';

import React from "react"

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Upload as UploadIcon, AlertCircle, CheckCircle } from 'lucide-react';

function UploadContent() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to upload videos
              </p>
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        // 500MB limit
        setError('Video file must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setThumbnailFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!thumbnailFile) {
      setError('Please select a thumbnail image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);

      const response = await apiClient.uploadVideo(
        formData,
        token!,
        (progress) => setUploadProgress(progress)
      );

      if (response.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnailFile(null);
        setUploadProgress(0);

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 border-0 shadow-lg">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Upload News Video</h1>
              <p className="text-muted-foreground">
                Share your news video with our community
              </p>
            </div>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Video uploaded successfully!</p>
                  <p className="text-sm">Redirecting to home...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && !success && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Video Title *</label>
                <Input
                  type="text"
                  placeholder="Breaking News: Earthquake in Tokyo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe your news video here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Video File *</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm">
                    {videoFile ? videoFile.name : 'Click to select video file'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, WebM, or other video formats (max 500MB)
                  </p>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail Image *</label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm">
                    {thumbnailFile ? thumbnailFile.name : 'Click to select thumbnail'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WebP (recommended 1280x720)
                  </p>
                </button>
              </div>

              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload Progress</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !videoFile || !thumbnailFile}
              >
                {loading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Video'}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function UploadPage() {
  return (
    <AuthProvider>
      <UploadContent />
    </AuthProvider>
  );
}
