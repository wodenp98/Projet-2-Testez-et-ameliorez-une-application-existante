describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('.card-header').should('contain', 'Login');
    cy.get('input[formcontrolname="login"]').should('be.visible');
    cy.get('input[formcontrolname="password"]').should('be.visible');
    cy.get('button').contains('Login').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.get('button').contains('Login').click();
    cy.contains('Login is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should mark invalid fields with is-invalid class on submit', () => {
    cy.get('button').contains('Login').click();
    cy.get('input[formcontrolname="login"]').should('have.class', 'is-invalid');
    cy.get('input[formcontrolname="password"]').should('have.class', 'is-invalid');
  });

  it('should login successfully and redirect to /students', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: 'fake-jwt-token',
      headers: { 'content-type': 'text/plain' },
    }).as('loginRequest');

    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [],
    });

    cy.get('input[formcontrolname="login"]').type('testuser');
    cy.get('input[formcontrolname="password"]').type('testpassword');
    cy.get('button').contains('Login').click();

    cy.wait('@loginRequest').its('request.body').should('deep.equal', {
      login: 'testuser',
      password: 'testpassword',
    });

    cy.url().should('include', '/students');
  });

  it('should store JWT token in localStorage after successful login', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: 'fake-jwt-token',
      headers: { 'content-type': 'text/plain' },
    }).as('loginRequest');

    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [],
    });

    cy.get('input[formcontrolname="login"]').type('testuser');
    cy.get('input[formcontrolname="password"]').type('testpassword');
    cy.get('button').contains('Login').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/students');

    cy.window()
      .its('localStorage')
      .invoke('getItem', 'jwt_token')
      .should('eq', 'fake-jwt-token');
  });

  it('should show error message on login failure', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid credentials' }),
      headers: { 'content-type': 'text/plain' },
    }).as('loginRequest');

    cy.get('input[formcontrolname="login"]').type('baduser');
    cy.get('input[formcontrolname="password"]').type('badpassword');
    cy.get('button').contains('Login').click();

    cy.wait('@loginRequest');
    cy.get('.alert-danger').should('contain', 'Invalid credentials');
  });

  it('should show generic error message on unexpected error format', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 500,
      body: 'not-json',
      headers: { 'content-type': 'text/plain' },
    }).as('loginRequest');

    cy.get('input[formcontrolname="login"]').type('testuser');
    cy.get('input[formcontrolname="password"]').type('testpassword');
    cy.get('button').contains('Login').click();

    cy.wait('@loginRequest');
    cy.get('.alert-danger').should('contain', 'An unexpected error occurred');
  });

  it('should show spinner while loading', () => {
    cy.intercept('POST', '/api/login', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: 'fake-jwt-token',
        headers: { 'content-type': 'text/plain' },
      });
    });

    cy.get('input[formcontrolname="login"]').type('testuser');
    cy.get('input[formcontrolname="password"]').type('testpassword');
    cy.get('button').contains('Login').click();

    cy.get('mat-spinner').should('be.visible');
  });
});
