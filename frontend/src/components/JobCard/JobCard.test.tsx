import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { JobCard, JOB_CARD_FALLBACKS } from './JobCard';

declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveNoViolations(): R;
    }
  }
}

describe('JobCard', () => {
  it('renders title, company name, and location from props', () => {
    render(
      <JobCard
        title="Senior Platform Engineer"
        companyName="Acme Corp"
        location="Remote — EU"
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Senior Platform Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Remote — EU')).toBeInTheDocument();
  });

  it('shows fallback UI when required display fields are missing or blank', () => {
    render(<JobCard title={undefined} companyName={undefined} location={undefined} />);

    expect(screen.getByRole('heading', { level: 2, name: JOB_CARD_FALLBACKS.title })).toBeInTheDocument();
    expect(screen.getByTestId('job-card-company')).toHaveTextContent(JOB_CARD_FALLBACKS.companyName);
    expect(screen.getByTestId('job-card-location')).toHaveTextContent(JOB_CARD_FALLBACKS.location);
  });

  it('treats whitespace-only strings as missing and uses fallbacks', () => {
    render(<JobCard title="   " companyName={'\t'} location={'\n'} />);

    expect(screen.getByRole('heading', { level: 2, name: JOB_CARD_FALLBACKS.title })).toBeInTheDocument();
    expect(screen.getByTestId('job-card-company')).toHaveTextContent(JOB_CARD_FALLBACKS.companyName);
    expect(screen.getByTestId('job-card-location')).toHaveTextContent(JOB_CARD_FALLBACKS.location);
  });

  it('has no accessibility violations (axe)', async () => {
    const { container } = render(
      <JobCard title="Designer" companyName="Globex" location="Berlin" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when using fallback copy', async () => {
    const { container } = render(<JobCard />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
