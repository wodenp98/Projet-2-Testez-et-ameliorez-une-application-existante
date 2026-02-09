describe('Student Form Page', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Create Mode (/students/new)', () => {
    beforeEach(() => {
      cy.visit('/students/new');
    });

    it('should display the create form with correct title', () => {
      cy.get('.card-header').should('contain', 'Add Student');
      cy.get('input[formcontrolname="firstName"]').should('be.visible');
      cy.get('input[formcontrolname="lastName"]').should('be.visible');
      cy.get('input[formcontrolname="email"]').should('be.visible');
      cy.get('button').contains('Create').should('be.visible');
    });

    it('should display Back to list button', () => {
      cy.get('button').contains('Back to list').should('be.visible');
    });

    it('should show validation errors when submitting empty form', () => {
      cy.get('button').contains('Create').click();
      cy.contains('First Name is required').should('be.visible');
      cy.contains('Last Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
    });

    it('should show email validation error for invalid email', () => {
      cy.get('input[formcontrolname="firstName"]').type('John');
      cy.get('input[formcontrolname="lastName"]').type('Doe');
      cy.get('input[formcontrolname="email"]').type('not-an-email');
      cy.get('button').contains('Create').click();

      cy.contains('Email must be valid').should('be.visible');
    });

    it('should mark invalid fields with is-invalid class on submit', () => {
      cy.get('button').contains('Create').click();
      cy.get('input[formcontrolname="firstName"]').should('have.class', 'is-invalid');
      cy.get('input[formcontrolname="lastName"]').should('have.class', 'is-invalid');
      cy.get('input[formcontrolname="email"]').should('have.class', 'is-invalid');
    });

    it('should create a student and redirect to /students', () => {
      const newStudent = {
        id: 4,
        firstName: 'Bob',
        lastName: 'Martin',
        email: 'bob.martin@example.com',
        created_at: '2025-04-01T12:00:00',
        updated_at: '2025-04-01T12:00:00',
      };

      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: newStudent,
      }).as('createStudent');

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: [newStudent],
      });

      cy.get('input[formcontrolname="firstName"]').type('Bob');
      cy.get('input[formcontrolname="lastName"]').type('Martin');
      cy.get('input[formcontrolname="email"]').type('bob.martin@example.com');
      cy.get('button').contains('Create').click();

      cy.wait('@createStudent').its('request.body').should('deep.equal', {
        firstName: 'Bob',
        lastName: 'Martin',
        email: 'bob.martin@example.com',
      });

      cy.url().should('match', /\/students$/);
    });

    it('should show error message on create failure', () => {
      cy.intercept('POST', '/api/students', { statusCode: 500 }).as('createStudent');

      cy.get('input[formcontrolname="firstName"]').type('Bob');
      cy.get('input[formcontrolname="lastName"]').type('Martin');
      cy.get('input[formcontrolname="email"]').type('bob.martin@example.com');
      cy.get('button').contains('Create').click();

      cy.wait('@createStudent');
      cy.get('.alert-danger').should('contain', 'Failed to create student.');
    });

    it('should navigate back to /students when Back to list is clicked', () => {
      cy.intercept('GET', '/api/students', { statusCode: 200, body: [] });
      cy.get('button').contains('Back to list').click();
      cy.url().should('match', /\/students$/);
    });
  });

  describe('Edit Mode (/students/:id/edit)', () => {
    const existingStudent = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      created_at: '2025-01-15T10:30:00',
      updated_at: '2025-01-15T10:30:00',
    };

    beforeEach(() => {
      cy.intercept('GET', '/api/students/1', {
        statusCode: 200,
        body: existingStudent,
      }).as('getStudent');
    });

    it('should display the edit form with correct title', () => {
      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('.card-header').should('contain', 'Edit Student');
    });

    it('should pre-fill form with existing student data', () => {
      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('input[formcontrolname="firstName"]').should('have.value', 'John');
      cy.get('input[formcontrolname="lastName"]').should('have.value', 'Doe');
      cy.get('input[formcontrolname="email"]').should('have.value', 'john.doe@example.com');
    });

    it('should display Update button instead of Create', () => {
      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('button').contains('Update').should('be.visible');
      cy.get('button').contains('Create').should('not.exist');
    });

    it('should update student and redirect to /students', () => {
      const updatedStudent = {
        ...existingStudent,
        firstName: 'Johnny',
        email: 'johnny.doe@example.com',
        updated_at: '2025-04-01T12:00:00',
      };

      cy.intercept('PUT', '/api/students/1', {
        statusCode: 200,
        body: updatedStudent,
      }).as('updateStudent');

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: [updatedStudent],
      });

      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('input[formcontrolname="firstName"]').clear().type('Johnny');
      cy.get('input[formcontrolname="email"]').clear().type('johnny.doe@example.com');
      cy.get('button').contains('Update').click();

      cy.wait('@updateStudent').its('request.body').should('deep.equal', {
        firstName: 'Johnny',
        lastName: 'Doe',
        email: 'johnny.doe@example.com',
      });

      cy.url().should('match', /\/students$/);
    });

    it('should show error message on update failure', () => {
      cy.intercept('PUT', '/api/students/1', { statusCode: 500 }).as('updateStudent');

      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('input[formcontrolname="firstName"]').clear().type('Johnny');
      cy.get('button').contains('Update').click();

      cy.wait('@updateStudent');
      cy.get('.alert-danger').should('contain', 'Failed to update student.');
    });

    it('should show error when failing to load student for editing', () => {
      cy.intercept('GET', '/api/students/999', { statusCode: 404 }).as('getStudent404');
      cy.visit('/students/999/edit');
      cy.wait('@getStudent404');

      cy.get('.alert-danger').should('contain', 'Failed to load student.');
    });

    it('should show spinner while loading student data for edit', () => {
      cy.intercept('GET', '/api/students/1', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: existingStudent,
        });
      }).as('getStudentSlow');
      cy.visit('/students/1/edit');

      cy.get('mat-spinner').should('be.visible');
    });

    it('should navigate back to /students when Back to list is clicked', () => {
      cy.intercept('GET', '/api/students', { statusCode: 200, body: [] });
      cy.visit('/students/1/edit');
      cy.wait('@getStudent');

      cy.get('button').contains('Back to list').click();
      cy.url().should('match', /\/students$/);
    });
  });
});
