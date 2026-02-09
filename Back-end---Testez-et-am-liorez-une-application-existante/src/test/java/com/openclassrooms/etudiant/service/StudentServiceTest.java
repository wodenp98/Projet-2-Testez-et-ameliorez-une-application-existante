package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class StudentServiceTest {

    private static final String FIRST_NAME = "Alice";
    private static final String LAST_NAME = "Dupont";
    private static final String EMAIL = "alice@mail.com";

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    public void test_create_student() {
        // GIVEN - On configure findByEmail pour retourner Optional.empty() (pas de doublon)
        // et save pour retourner le student passe en parametre
        Student student = new Student();
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);

        when(studentRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // WHEN - On appelle la methode create
        Student result = studentService.create(student);

        // THEN - save() est appele et retourne le student cree
        verify(studentRepository).save(student);
        assertThat(result).isEqualTo(student);
        assertThat(result.getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(result.getLastName()).isEqualTo(LAST_NAME);
        assertThat(result.getEmail()).isEqualTo(EMAIL);
    }

    @Test
    public void test_findAll_students() {
        // GIVEN - On configure findAll pour retourner une liste de 2 students
        Student student1 = new Student();
        student1.setFirstName("Alice");
        student1.setLastName("Dupont");
        student1.setEmail("alice@mail.com");

        Student student2 = new Student();
        student2.setFirstName("Bob");
        student2.setLastName("Martin");
        student2.setEmail("bob@mail.com");

        List<Student> students = Arrays.asList(student1, student2);
        when(studentRepository.findAll()).thenReturn(students);

        // WHEN - On appelle findAll
        List<Student> result = studentService.findAll();

        // THEN - La liste retournee contient bien les 2 students
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(student1, student2);
    }

    @Test
    public void test_findById_student() {
        // GIVEN - On configure findById(1L) pour retourner un student
        Student student = new Student();
        student.setId(1L);
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // WHEN - On appelle findById avec l'id 1
        Student result = studentService.findById(1L);

        // THEN - Le student retourne correspond a celui configure
        assertThat(result).isEqualTo(student);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    public void test_update_student() {
        // GIVEN - On configure findById pour retourner un student existant
        // et findByEmail pour retourner Optional.empty() (pas de conflit d'email)
        Student existingStudent = new Student();
        existingStudent.setId(1L);
        existingStudent.setFirstName(FIRST_NAME);
        existingStudent.setLastName(LAST_NAME);
        existingStudent.setEmail(EMAIL);

        Student updatedData = new Student();
        updatedData.setFirstName("Bob");
        updatedData.setLastName("Martin");
        updatedData.setEmail("bob@mail.com");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(existingStudent));
        when(studentRepository.findByEmail("bob@mail.com")).thenReturn(Optional.empty());
        when(studentRepository.save(any(Student.class))).thenReturn(existingStudent);

        // WHEN - On appelle update avec les nouvelles donnees
        Student result = studentService.update(1L, updatedData);

        // THEN - save() est appele et les champs sont mis a jour
        verify(studentRepository).save(existingStudent);
        assertThat(result.getFirstName()).isEqualTo("Bob");
        assertThat(result.getLastName()).isEqualTo("Martin");
        assertThat(result.getEmail()).isEqualTo("bob@mail.com");
    }

    @Test
    public void test_delete_student() {
        // GIVEN - On configure existsById(1L) pour retourner true
        when(studentRepository.existsById(1L)).thenReturn(true);

        // WHEN - On appelle delete avec l'id 1
        studentService.delete(1L);

        // THEN - deleteById(1L) est bien appele sur le repository
        verify(studentRepository).deleteById(1L);
    }
}
