describe('Employer job posting flow', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  /** Ensures the fixture employer exists (idempotent for CI and local reruns). */
  before(() => {
    cy.fixture('employerUser').then((user: { email: string; password: string }) => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: {
          email: user.email,
          password: user.password,
          role: 'employer',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status, 'register employer once').to.be.oneOf([201, 409]);
      });
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('logs in, posts a job, intercepts POST /jobs, and shows the title in listings', () => {
    const uniqueTitle = `E2E Cypress Job ${Date.now()}`;
    const description =
      'End-to-end Cypress description for employer job posting flow validation.';
    const location = 'Remote';

    cy.fixture('employerUser').then((user: { email: string; password: string }) => {
      cy.intercept('POST', '**/jobs').as('createJob');

      cy.visit('/login');
      cy.get('[data-testid="login-email"]').clear().type(user.email);
      cy.get('[data-testid="login-password"]').clear().type(user.password);
      cy.get('[data-testid="login-submit"]').click();

      cy.window()
        .its('localStorage.accessToken')
        .should('be.a', 'string')
        .and('have.length.at.least', 20);

      cy.visit('/employer/post');
      cy.get('[data-testid="job-title"]').clear().type(uniqueTitle);
      cy.get('[data-testid="job-description"]').clear().type(description);
      cy.get('[data-testid="job-location"]').clear().type(location);
      cy.get('[data-testid="job-category"]').select('full_time');
      cy.get('[data-testid="job-submit"]').click();

      cy.wait('@createJob').its('response.statusCode').should('eq', 201);

      cy.visit('/jobs');
      cy.get('[data-testid="job-search"]').clear().type(uniqueTitle);
      cy.get('[data-testid="job-listing-title"]').should('contain.text', uniqueTitle);
    });
  });
});
