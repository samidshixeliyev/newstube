export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  uploader: {
    id: string;
    name: string;
  };
  createdAt: string;
  views: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }

  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getVideos(page: number = 1, limit: number = 10): Promise<ApiResponse<{ videos: Video[]; total: number }>> {
    const response = await fetch(`${this.baseUrl}/videos?page=${page}&limit=${limit}`);
    return response.json();
  }

  async getVideoById(id: string): Promise<ApiResponse<Video>> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`);
    return response.json();
  }

  async uploadVideo(
    formData: FormData,
    token: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Video>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}/videos/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  async deleteVideo(id: string, token: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  async updateVideoViews(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/videos/${id}/views`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async updateVideoDetails(
    id: string,
    data: { title: string; description: string },
    token: string
  ): Promise<ApiResponse<Video>> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
