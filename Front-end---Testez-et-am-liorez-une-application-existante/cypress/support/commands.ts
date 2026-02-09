declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
  }
}

Cypress.Commands.add('login', () => {
  window.localStorage.setItem('jwt_token', 'fake-jwt-token-for-testing');
});
