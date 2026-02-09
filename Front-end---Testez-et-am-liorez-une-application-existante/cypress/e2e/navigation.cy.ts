describe('Navigation Bar', () => {
  describe('when not logged in', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should show Login and Register links', () => {
      cy.get('nav').contains('Login').should('be.visible');
      cy.get('nav').contains('Register').should('be.visible');
    });

    it('should not show Students link', () => {
      cy.get('nav').contains('Students').should('not.exist');
    });

    it('should not show Logout link', () => {
      cy.get('nav').contains('Logout').should('not.exist');
    });

    it('should show the app brand "Student Manager"', () => {
      cy.get('.navbar-brand').should('contain', 'Student Manager');
    });

    it('should navigate to /register when Register link is clicked', () => {
      cy.get('nav').contains('Register').click();
      cy.url().should('include', '/register');
      cy.get('.card-header').should('contain', 'Registration Form');
    });

    it('should navigate to /login when Login link is clicked', () => {
      cy.visit('/register');
      cy.get('nav').contains('Login').click();
      cy.url().should('include', '/login');
      cy.get('.card-header').should('contain', 'Login');
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: [],
      }).as('getStudents');
      cy.visit('/students');
    });

    it('should show Students and Logout links', () => {
      cy.get('nav').contains('Students').should('be.visible');
      cy.get('nav').contains('Logout').should('be.visible');
    });

    it('should not show Login and Register links', () => {
      cy.get('nav').contains('Login').should('not.exist');
      cy.get('nav').contains('Register').should('not.exist');
    });

    it('should logout and redirect to /login when Logout is clicked', () => {
      cy.get('nav').contains('Logout').click();
      cy.url().should('include', '/login');

      cy.window()
        .its('localStorage')
        .invoke('getItem', 'jwt_token')
        .should('be.null');

      cy.get('nav').contains('Login').should('be.visible');
      cy.get('nav').contains('Register').should('be.visible');
    });
  });

  describe('auth guard', () => {
    it('should redirect to /login when accessing /students without auth', () => {
      cy.visit('/students');
      cy.url().should('include', '/login');
    });

    it('should redirect to /login when accessing /students/1 without auth', () => {
      cy.visit('/students/1');
      cy.url().should('include', '/login');
    });

    it('should redirect to /login when accessing /students/new without auth', () => {
      cy.visit('/students/new');
      cy.url().should('include', '/login');
    });

    it('should redirect to /login when accessing /students/1/edit without auth', () => {
      cy.visit('/students/1/edit');
      cy.url().should('include', '/login');
    });

    it('should allow access to /students when authenticated', () => {
      cy.login();
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: [],
      });
      cy.visit('/students');
      cy.url().should('include', '/students');
      cy.get('h2').should('contain', 'Students');
    });

    it('should redirect root path to /login', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });
  });
});
