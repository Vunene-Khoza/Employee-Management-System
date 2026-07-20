package net.javaguides.springboot.controller;

import net.javaguides.springboot.excpetion.ResourceNotFoundException;
import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.DepartmentRepository;
import net.javaguides.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DepartmentRepository departmentRepository;

    // ADMIN only - get all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // All authenticated users - get users by role
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public List<User> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(User.Role.valueOf(role.toUpperCase()));
    }

    // ADMIN only - create user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> request) {
        String email = String.valueOf(request.get("email"));
        String password = String.valueOf(request.get("password"));
        String role = String.valueOf(request.getOrDefault("role", "EMPLOYEE")).toUpperCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Email already in use"));
        }

        Long departmentId = null;
        Object departmentIdValue = request.get("departmentId");
        if (departmentIdValue != null) {
            String parsedDepartmentId = String.valueOf(departmentIdValue).trim();
            if (!parsedDepartmentId.isEmpty() && !"null".equalsIgnoreCase(parsedDepartmentId)) {
                departmentId = Long.parseLong(parsedDepartmentId);
            }
        }

        User.Role userRole = User.Role.valueOf(role);
        if (userRole == User.Role.SUPERVISOR && (departmentId == null || departmentId <= 0)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Supervisor must be linked to a department"));
        }

        User user = new User(
            email,
            passwordEncoder.encode(password),
            userRole,
            departmentId
        );
        userRepository.saveAndFlush(user);

        return ResponseEntity.ok(Map.of("message", "User created successfully"));
    }

    // ADMIN only - create supervisor (separate endpoint)
    @PostMapping("/supervisors")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createSupervisor(@RequestBody Map<String, Object> request) {
        String email = String.valueOf(request.get("email"));
        String password = String.valueOf(request.get("password"));

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Email already in use"));
        }

        Long departmentId = null;
        Object departmentIdValue = request.get("departmentId");
        if (departmentIdValue != null) {
            String parsedDepartmentId = String.valueOf(departmentIdValue).trim();
            if (!parsedDepartmentId.isEmpty() && !"null".equalsIgnoreCase(parsedDepartmentId)) {
                departmentId = Long.parseLong(parsedDepartmentId);
            }
        }

        if (departmentId == null || departmentId <= 0) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Supervisor must be linked to a valid department"));
        }

        if (!departmentRepository.existsById(departmentId)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Department not found"));
        }

        User supervisor = new User(
            email,
            passwordEncoder.encode(password),
            User.Role.SUPERVISOR,
            departmentId
        );
        userRepository.saveAndFlush(supervisor);

        return ResponseEntity.ok(Map.of("message", "Supervisor created successfully"));
    }

    // ALL authenticated users - get all supervisors
    @GetMapping("/supervisors")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public List<User> getSupervisors() {
        return userRepository.findByRole(User.Role.SUPERVISOR);
    }

    // ADMIN only - get all employees (accounts)
    @GetMapping("/accounts/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getEmployeeAccounts() {
        return userRepository.findByRole(User.Role.EMPLOYEE);
    }

    // ADMIN only - get user by id
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return ResponseEntity.ok(user);
    }

    // ADMIN only - update user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.containsKey("email")) {
            String newEmail = String.valueOf(request.get("email"));
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
            }
            user.setEmail(newEmail);
        }

        if (request.containsKey("password")) {
            String password = String.valueOf(request.get("password"));
            if (password != null && !password.isEmpty() && !"null".equalsIgnoreCase(password)) {
                user.setPassword(passwordEncoder.encode(password));
            }
        }

        if (request.containsKey("role")) {
            user.setRole(User.Role.valueOf(String.valueOf(request.get("role")).toUpperCase()));
        }

        if (request.containsKey("departmentId")) {
            Object deptId = request.get("departmentId");
            if (deptId == null || "null".equalsIgnoreCase(String.valueOf(deptId))) {
                user.setDepartmentId(null);
            } else {
                user.setDepartmentId(Long.parseLong(String.valueOf(deptId)));
            }
        }

        userRepository.saveAndFlush(user);
        return ResponseEntity.ok(Map.of("message", "User updated successfully"));
    }

    // ADMIN only - delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("deleted", Boolean.TRUE));
    }
}
