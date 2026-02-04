'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) return;
    router.push('/upload');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">NewsVid</span>
          </Link>

          {/* Center - Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
          </div>

          {/* Right - Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleUploadClick}
                  disabled={!isAuthenticated}
                  className={`p-2 rounded-lg transition-colors ${
                    isAuthenticated
                      ? 'hover:bg-accent text-foreground cursor-pointer'
                      : 'text-muted-foreground cursor-not-allowed opacity-50'
                  }`}
                  title={isAuthenticated ? 'Upload video' : 'Login to upload'}
                >
                  <Upload className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Welcome,</span>
                  <span className="font-medium">{user?.name}</span>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
