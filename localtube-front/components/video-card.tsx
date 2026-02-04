'use client';

import { Video } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Eye, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <svg
                className="w-6 h-6 text-foreground fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 hover:text-primary transition-colors">
            {video.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{video.uploader.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              <span>{video.views.toLocaleString()} views</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
