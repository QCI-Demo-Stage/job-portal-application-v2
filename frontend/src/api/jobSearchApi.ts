export interface JobSearchResult {
  id: string;
  title: string;
  companyName: string;
  location: string;
}

/**
 * Calls the job search API. Replace with real `fetch` wiring when the endpoint is available.
 */
export async function searchJobs(query: string): Promise<JobSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const response = await fetch(`/api/jobs/search?q=${encodeURIComponent(trimmed)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Job search failed (${response.status})`);
  }

  return (await response.json()) as JobSearchResult[];
}
