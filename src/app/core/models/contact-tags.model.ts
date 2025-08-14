export interface ContactTag {
  id: string;
  name: string;
}

export interface ContactTagsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: {
    tags: ContactTag[];
    total_count: number;
    total_pages: number;
    limit: number;
    page: number;
  };
} 