'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient, Video } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface EditVideoModalProps {
  video: Video;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedVideo: Video) => void;
}

export function EditVideoModal({
  video,
  open,
  onOpenChange,
  onSuccess,
}: EditVideoModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await apiClient.updateVideoDetails(
        video.id,
        { title: title.trim(), description: description.trim() },
        token
      );

      if (response.data) {
        onSuccess(response.data);
        onOpenChange(false);
      } else {
        setError(response.message || 'Failed to update video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle(video.title);
    setDescription(video.description);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Video Details</DialogTitle>
          <DialogDescription>
            Update the title and description of your video
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={6}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
