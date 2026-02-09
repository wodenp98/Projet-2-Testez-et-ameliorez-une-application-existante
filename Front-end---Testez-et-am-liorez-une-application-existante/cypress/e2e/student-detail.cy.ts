describe('Student Detail Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display student details', () => {
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
    cy.visit('/students/1');
    cy.wait('@getStudent');

    cy.get('.card-header h3').should('contain', 'John Doe');
    cy.contains('ID:').parent().should('contain', '1');
    cy.contains('First Name:').parent().should('contain', 'John');
    cy.contains('Last Name:').parent().should('contain', 'Doe');
    cy.contains('Email:').parent().should('contain', 'john.doe@example.com');
    cy.contains('Created at:').should('be.visible');
    cy.contains('Updated at:').should('be.visible');
  });

  it('should display the Back to list button', () => {
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
    cy.visit('/students/1');
    cy.wait('@getStudent');

    cy.get('button').contains('Back to list').should('be.visible');
  });

  it('should display the Edit button', () => {
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
    cy.visit('/students/1');
    cy.wait('@getStudent');

    cy.get('button').contains('Edit').should('be.visible');
  });

  it('should navigate back to /students when Back to list is clicked', () => {
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });
    cy.visit('/students/1');
    cy.wait('@getStudent');

    cy.get('button').contains('Back to list').click();
    cy.url().should('match', /\/students$/);
  });

  it('should navigate to /students/1/edit when Edit is clicked', () => {
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
    cy.visit('/students/1');
    cy.wait('@getStudent');

    cy.get('.card-footer button').contains('Edit').click();
    cy.url().should('include', '/students/1/edit');
  });

  it('should show error message when student is not found', () => {
    cy.intercept('GET', '/api/students/999', { statusCode: 404 }).as('getStudent');
    cy.visit('/students/999');
    cy.wait('@getStudent');

    cy.get('.alert-danger').should('contain', 'Student not found.');
  });

  it('should show spinner while loading', () => {
    cy.intercept('GET', '/api/students/1', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        fixture: 'student.json',
      });
    });
    cy.visit('/students/1');

    cy.get('mat-spinner').should('be.visible');
  });
});
