'use client';

import { Navbar } from '@/components/navbar';
import { VideoFeed } from '@/components/video-feed';
import { AuthProvider } from '@/lib/auth-context';

export default function Home() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Latest News Videos</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest news from around the world
            </p>
          </div>

          <VideoFeed />
        </div>
      </main>
    </AuthProvider>
  );
}
