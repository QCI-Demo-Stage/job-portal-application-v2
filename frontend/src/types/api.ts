/** Shape of job rows returned by `GET /jobs` (`data` array). */
export interface JobListing {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  category: string | null;
  employerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedJobsBody {
  data: JobListing[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthSessionBody {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/** NestJS-style error payloads. */
export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}
