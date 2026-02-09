describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.get('.card-header').should('contain', 'Registration Form');
    cy.get('input[formcontrolname="firstName"]').should('be.visible');
    cy.get('input[formcontrolname="lastName"]').should('be.visible');
    cy.get('input[formcontrolname="login"]').should('be.visible');
    cy.get('input[formcontrolname="password"]').should('be.visible');
    cy.get('button').contains('Register').should('be.visible');
    cy.get('button').contains('Cancel').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.get('button').contains('Register').click();
    cy.contains('First Name is required').should('be.visible');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Login is required').should('be.visible');
    cy.contains('password is required').should('be.visible');
  });

  it('should show validation error only for empty fields', () => {
    cy.get('input[formcontrolname="firstName"]').type('John');
    cy.get('button').contains('Register').click();
    cy.contains('First Name is required').should('not.exist');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Login is required').should('be.visible');
    cy.contains('password is required').should('be.visible');
  });

  it('should mark invalid fields with is-invalid class on submit', () => {
    cy.get('button').contains('Register').click();
    cy.get('input[formcontrolname="firstName"]').should('have.class', 'is-invalid');
    cy.get('input[formcontrolname="lastName"]').should('have.class', 'is-invalid');
    cy.get('input[formcontrolname="login"]').should('have.class', 'is-invalid');
    cy.get('input[formcontrolname="password"]').should('have.class', 'is-invalid');
  });

  it('should register successfully and redirect to /login', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 201,
      body: {},
    }).as('registerRequest');

    cy.get('input[formcontrolname="firstName"]').type('John');
    cy.get('input[formcontrolname="lastName"]').type('Doe');
    cy.get('input[formcontrolname="login"]').type('johndoe');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.get('button').contains('Register').click();

    cy.wait('@registerRequest').its('request.body').should('deep.equal', {
      firstName: 'John',
      lastName: 'Doe',
      login: 'johndoe',
      password: 'password123',
    });

    cy.url().should('include', '/login');
  });

  it('should reset the form when Cancel is clicked', () => {
    cy.get('input[formcontrolname="firstName"]').type('John');
    cy.get('input[formcontrolname="lastName"]').type('Doe');
    cy.get('input[formcontrolname="login"]').type('johndoe');
    cy.get('input[formcontrolname="password"]').type('password123');

    cy.get('button').contains('Cancel').click();

    cy.get('input[formcontrolname="firstName"]').should('have.value', '');
    cy.get('input[formcontrolname="lastName"]').should('have.value', '');
    cy.get('input[formcontrolname="login"]').should('have.value', '');
    cy.get('input[formcontrolname="password"]').should('have.value', '');
  });
});
