import React from 'react';

export const JOB_CARD_FALLBACKS = {
  title: 'Untitled position',
  companyName: 'Company not listed',
  location: 'Location not specified',
} as const;

export interface JobCardProps {
  /** Job listing title */
  title?: string;
  /** Employer or company display name */
  companyName?: string;
  /** Work location label */
  location?: string;
}

/**
 * Compact summary of a job for lists and search results.
 */
export function JobCard({ title, companyName, location }: JobCardProps): JSX.Element {
  const displayTitle = title?.trim() || JOB_CARD_FALLBACKS.title;
  const displayCompany = companyName?.trim() || JOB_CARD_FALLBACKS.companyName;
  const displayLocation = location?.trim() || JOB_CARD_FALLBACKS.location;

  const titleId = React.useId();

  return (
    <article
      className="job-card"
      aria-labelledby={titleId}
      data-testid="job-card"
    >
      <h2 id={titleId} className="job-card__title">
        {displayTitle}
      </h2>
      <p className="job-card__company" data-testid="job-card-company">
        {displayCompany}
      </p>
      <p className="job-card__location" data-testid="job-card-location">
        {displayLocation}
      </p>
    </article>
  );
}
