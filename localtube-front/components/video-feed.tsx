'use client';

import { useEffect, useState } from 'react';
import { VideoCard } from './video-card';
import { Video, apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiClient.getVideos(page, 12);
        if (response.data) {
          if (page === 1) {
            setVideos(response.data.videos);
          } else {
            setVideos((prev) => [...prev, ...response.data.videos]);
          }
          setHasMore(response.data.videos.length === 12);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page]);

  if (loading && page === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-2/3 h-4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setPage((p) => p + 1)}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos found</p>
        </div>
      )}
    </div>
  );
}
