package com.openclassrooms.etudiant.controller;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.CreateStudentDTO;
import com.openclassrooms.etudiant.dto.UpdateStudentDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    private static final String STUDENTS_URL = "/api/students";

    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:8.0");

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    private String jwtToken;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @BeforeEach
    public void setUp() {
        // Prerequis : on cree un utilisateur et on recupere le JWT pour authentifier les requetes
        User user = new User();
        user.setFirstName("Admin");
        user.setLastName("Test");
        user.setLogin("admin");
        user.setPassword("password");
        userService.register(user);
        jwtToken = userService.login("admin", "password");
    }

    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void test_create_student() throws Exception {
        // GIVEN - On prepare un CreateStudentDTO avec des donnees valides
        CreateStudentDTO dto = new CreateStudentDTO();
        dto.setFirstName("Alice");
        dto.setLastName("Dupont");
        dto.setEmail("alice@mail.com");

        // WHEN - POST /api/students avec le JWT en header Authorization
        // THEN - HTTP 201 Created, le body contient le student avec un id non-null
        mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").isNotEmpty())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Alice"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Dupont"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("alice@mail.com"));
    }

    @Test
    public void test_findAll_students() throws Exception {
        // GIVEN - On cree 2 students via POST
        CreateStudentDTO dto1 = new CreateStudentDTO();
        dto1.setFirstName("Alice");
        dto1.setLastName("Dupont");
        dto1.setEmail("alice@mail.com");

        CreateStudentDTO dto2 = new CreateStudentDTO();
        dto2.setFirstName("Bob");
        dto2.setLastName("Martin");
        dto2.setEmail("bob@mail.com");

        mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                .header("Authorization", "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(dto1))
                .contentType(MediaType.APPLICATION_JSON));

        mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                .header("Authorization", "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(dto2))
                .contentType(MediaType.APPLICATION_JSON));

        // WHEN - GET /api/students
        // THEN - HTTP 200 OK, le body contient une liste de 2 elements
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL)
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(2));
    }

    @Test
    public void test_findById_student() throws Exception {
        // GIVEN - On cree 1 student via POST et on recupere son id
        CreateStudentDTO dto = new CreateStudentDTO();
        dto.setFirstName("Alice");
        dto.setLastName("Dupont");
        dto.setEmail("alice@mail.com");

        MvcResult createResult = mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andReturn();

        Integer studentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asInt();

        // WHEN - GET /api/students/{id}
        // THEN - HTTP 200 OK, le body contient le student avec le bon id
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL + "/" + studentId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(studentId))
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Alice"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Dupont"));
    }

    @Test
    public void test_update_student() throws Exception {
        // GIVEN - On cree 1 student via POST et on recupere son id
        CreateStudentDTO createDto = new CreateStudentDTO();
        createDto.setFirstName("Alice");
        createDto.setLastName("Dupont");
        createDto.setEmail("alice@mail.com");

        MvcResult createResult = mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(createDto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andReturn();

        Integer studentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asInt();

        // On prepare les donnees de mise a jour
        UpdateStudentDTO updateDto = new UpdateStudentDTO();
        updateDto.setFirstName("Bob");
        updateDto.setLastName("Martin");
        updateDto.setEmail("bob@mail.com");

        // WHEN - PUT /api/students/{id} avec les nouvelles donnees
        // THEN - HTTP 200 OK, le body contient les champs mis a jour
        mockMvc.perform(MockMvcRequestBuilders.put(STUDENTS_URL + "/" + studentId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(updateDto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Bob"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Martin"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("bob@mail.com"));
    }

    @Test
    public void test_delete_student() throws Exception {
        // GIVEN - On cree 1 student via POST et on recupere son id
        CreateStudentDTO dto = new CreateStudentDTO();
        dto.setFirstName("Alice");
        dto.setLastName("Dupont");
        dto.setEmail("alice@mail.com");

        MvcResult createResult = mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(dto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andReturn();

        Integer studentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asInt();

        // WHEN - DELETE /api/students/{id}
        // THEN - HTTP 204 No Content
        mockMvc.perform(MockMvcRequestBuilders.delete(STUDENTS_URL + "/" + studentId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }
}
