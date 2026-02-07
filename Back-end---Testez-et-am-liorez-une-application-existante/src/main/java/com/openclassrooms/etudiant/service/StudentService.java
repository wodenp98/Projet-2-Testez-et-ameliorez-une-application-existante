package com.openclassrooms.etudiant.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.handler.NotFoundException;
import com.openclassrooms.etudiant.repository.StudentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public Student create(Student student) {
        Assert.notNull(student, "Student must not be null");
        log.info("Creating new student");

        studentRepository.findByEmail(student.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Student with email " + student.getEmail() + " already exists");
        });

        return studentRepository.save(student);
    }

    public List<Student> findAll() {
        log.info("Fetching all students");
        return studentRepository.findAll();
    }

    public Student findById(Long id) {
        Assert.notNull(id, "Student id must not be null");
        log.info("Fetching student with id: {}", id);
        return studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student not found with id: " + id));
    }

    public Student update(Long id, Student updatedData) {
        Assert.notNull(id, "Student id must not be null");
        Assert.notNull(updatedData, "Student data must not be null");
        log.info("Updating student with id: {}", id);

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student not found with id: " + id));

        if (!existingStudent.getEmail().equals(updatedData.getEmail())) {
            studentRepository.findByEmail(updatedData.getEmail()).ifPresent(other -> {
                throw new IllegalArgumentException("Student with email " + updatedData.getEmail() + " already exists");
            });
        }

        existingStudent.setFirstName(updatedData.getFirstName());
        existingStudent.setLastName(updatedData.getLastName());
        existingStudent.setEmail(updatedData.getEmail());

        return studentRepository.save(existingStudent);
    }

    public void delete(Long id) {
        Assert.notNull(id, "Student id must not be null");
        log.info("Deleting student with id: {}", id);

        if (!studentRepository.existsById(id)) {
            throw new NotFoundException("Student not found with id: " + id);
        }

        studentRepository.deleteById(id);
    }
}
