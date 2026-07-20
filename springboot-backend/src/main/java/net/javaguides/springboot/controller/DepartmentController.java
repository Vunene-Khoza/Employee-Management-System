package net.javaguides.springboot.controller;

import net.javaguides.springboot.excpetion.ResourceNotFoundException;
import net.javaguides.springboot.model.Department;
import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.DepartmentRepository;
import net.javaguides.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    // ADMIN only — get all departments
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(departmentRepository.findAll());
    }

    // ADMIN only — create department
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> request) {
        String name = request.get("name");

        if (departmentRepository.existsByName(name)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Department already exists"));
        }

        Department department = new Department(name, null);
        return ResponseEntity.ok(departmentRepository.saveAndFlush(department));
    }

    // ADMIN only — get department by id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(department);
    }

    // ADMIN only — update department name
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        String newName = request.get("name");
        if (!department.getName().equals(newName) && departmentRepository.existsByName(newName)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Department name already exists"));
        }

        department.setName(newName);
        return ResponseEntity.ok(departmentRepository.saveAndFlush(department));
    }

    // ADMIN only — delete department
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> deleteDepartment(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        departmentRepository.delete(department);
        departmentRepository.flush();
        return ResponseEntity.ok(Map.of("deleted", Boolean.TRUE));
    }

    // ADMIN only — assign supervisor to department
    @PutMapping("/{id}/assign-supervisor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignSupervisor(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {

        Long supervisorId = request.get("supervisorId");

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supervisorId));

        if (supervisor.getRole() != User.Role.SUPERVISOR) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "User is not a SUPERVISOR"));
        }

        // unassign supervisor from previous department if any
        departmentRepository.findBySupervisorId(supervisorId).ifPresent(oldDept -> {
            oldDept.setSupervisorId(null);
            departmentRepository.saveAndFlush(oldDept);
        });

        // assign supervisor to department
        department.setSupervisorId(supervisorId);
        departmentRepository.saveAndFlush(department);

        // update supervisor's departmentId in users table
        supervisor.setDepartmentId(id);
        userRepository.saveAndFlush(supervisor);

        return ResponseEntity.ok(Map.of("message", "Supervisor assigned successfully"));
    }
}
