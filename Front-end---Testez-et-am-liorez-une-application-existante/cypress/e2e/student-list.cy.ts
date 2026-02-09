describe('Student List Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display the student list with data', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('h2').should('contain', 'Students');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length', 3);

    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'John');
      cy.get('td').eq(2).should('contain', 'Doe');
      cy.get('td').eq(3).should('contain', 'john.doe@example.com');
    });
  });

  it('should display table headers correctly', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('thead th').eq(0).should('contain', 'ID');
    cy.get('thead th').eq(1).should('contain', 'First Name');
    cy.get('thead th').eq(2).should('contain', 'Last Name');
    cy.get('thead th').eq(3).should('contain', 'Email');
    cy.get('thead th').eq(4).should('contain', 'Actions');
  });

  it('should display "No students found." when list is empty', () => {
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.contains('No students found.').should('be.visible');
  });

  it('should display View, Edit, Delete buttons for each student', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View').should('be.visible');
      cy.get('button').contains('Edit').should('be.visible');
      cy.get('button').contains('Delete').should('be.visible');
    });
  });

  it('should display the Add Student button', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('button').contains('Add Student').should('be.visible');
  });

  it('should navigate to /students/new when Add Student is clicked', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('button').contains('Add Student').click();
    cy.url().should('include', '/students/new');
  });

  it('should navigate to /students/1 when View is clicked', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' });
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View').click();
    });

    cy.url().should('include', '/students/1');
  });

  it('should navigate to /students/1/edit when Edit is clicked', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.intercept('GET', '/api/students/1', { fixture: 'student.json' });
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('Edit').click();
    });

    cy.url().should('include', '/students/1/edit');
  });

  it('should delete a student when Delete is clicked and confirmed', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('deleteStudent');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.on('window:confirm', () => true);

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('Delete').click();
    });

    cy.wait('@deleteStudent');
    cy.get('tbody tr').should('have.length', 2);
  });

  it('should not delete a student when Delete is clicked and cancelled', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.on('window:confirm', () => false);

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('Delete').click();
    });

    cy.get('tbody tr').should('have.length', 3);
  });

  it('should show error message when loading students fails', () => {
    cy.intercept('GET', '/api/students', { statusCode: 500, body: {} }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.get('.alert-danger').should('contain', 'Failed to load students.');
  });

  it('should show error message when delete fails', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
    cy.intercept('DELETE', '/api/students/1', { statusCode: 500 }).as('deleteStudent');
    cy.visit('/students');
    cy.wait('@getStudents');

    cy.on('window:confirm', () => true);

    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('Delete').click();
    });

    cy.wait('@deleteStudent');
    cy.get('.alert-danger').should('contain', 'Failed to delete student.');
  });

  it('should show spinner while loading', () => {
    cy.intercept('GET', '/api/students', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        fixture: 'students.json',
      });
    });
    cy.visit('/students');

    cy.get('mat-spinner').should('be.visible');
  });
});
