package com.openclassrooms.etudiant.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

public class JwtServiceTest {

    private static final String USERNAME = "login";
    // Cle secrete de 256 bits minimum requise pour l'algorithme HMAC-SHA
    private static final String SECRET = "b13c60a53489717c95b609e95b725c0c2f4a1f7c01779588bdb7939965e17676";

    private JwtService jwtService;

    @BeforeEach
    public void setUp() {
        // On instancie le service et on injecte les valeurs @Value via ReflectionTestUtils
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", 86400000L);
    }

    @Test
    public void test_generateToken() {
        // GIVEN - On cree un UserDetails avec username = "login"
        UserDetails userDetails = new User(USERNAME, "password", Collections.emptyList());

        // WHEN - On genere un token
        String token = jwtService.generateToken(userDetails);

        // THEN - Le token retourne est non-null et non-vide
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    public void test_extractUsername() {
        // GIVEN - On genere un token pour username = "login"
        UserDetails userDetails = new User(USERNAME, "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        // WHEN - On extrait le username du token
        String extractedUsername = jwtService.extractUsername(token);

        // THEN - Le username extrait correspond a celui utilise pour generer le token
        assertThat(extractedUsername).isEqualTo(USERNAME);
    }

    @Test
    public void test_validateToken() {
        // GIVEN - On genere un token valide pour un UserDetails donne
        UserDetails userDetails = new User(USERNAME, "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        // WHEN - On valide le token avec le meme UserDetails
        boolean isValid = jwtService.validateToken(token, userDetails);

        // THEN - Le token est valide (retourne true)
        assertThat(isValid).isTrue();
    }
}
