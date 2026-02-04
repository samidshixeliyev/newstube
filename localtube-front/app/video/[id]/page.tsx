'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Video, apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, User, Calendar, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { EditVideoModal } from '@/components/edit-video-modal';

function VideoDetailContent() {
  const params = useParams();
  const videoId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isVideoOwner = isAuthenticated && user && video && user.id === video.uploader.id;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await apiClient.getVideoById(videoId);
        if (response.data) {
          setVideo(response.data);
          // Update view count
          await apiClient.updateVideoViews(videoId);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load video'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Skeleton className="w-full aspect-video rounded-lg mb-8" />
            <Skeleton className="w-3/4 h-8 rounded mb-4" />
            <Skeleton className="w-full h-4 rounded mb-8" />
            <Skeleton className="w-full h-20 rounded" />
          </div>
        </main>
      </>
    );
  }

  if (error || !video) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Card className="p-8 text-center">
              <p className="text-destructive">{error || 'Video not found'}</p>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Video Player */}
          <div className="mb-8 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full"
              crossOrigin="anonymous"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-balance flex-1">
                {video.title}
              </h1>
              {isVideoOwner && (
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {video.uploader.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{video.views.toLocaleString()} views</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">About</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {video.description}
            </p>
          </Card>

          {/* Related Videos Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More Videos</h2>
            <p className="text-muted-foreground text-center py-8">
              More videos coming soon...
            </p>
          </div>
        </div>

        {/* Edit Video Modal */}
        {video && (
          <EditVideoModal
            video={video}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSuccess={setVideo}
          />
        )}
      </main>
    </>
  );
}

export default function VideoDetailPage() {
  return (
    <AuthProvider>
      <VideoDetailContent />
    </AuthProvider>
  );
}
