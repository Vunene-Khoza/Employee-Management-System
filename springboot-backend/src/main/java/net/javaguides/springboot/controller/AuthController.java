package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.UserRepository;
import net.javaguides.springboot.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1/auth")

public class AuthController {
	@Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String role = request.getOrDefault("role", "EMPLOYEE").toUpperCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        // parse departmentId if provided
        Long departmentId = null;
        if (request.get("departmentId") != null && !request.get("departmentId").isEmpty()) {
            departmentId = Long.parseLong(request.get("departmentId"));
        }

        User user = new User(
            email,
            passwordEncoder.encode(password),
            User.Role.valueOf(role),
            departmentId  // ← 4th argument added
        );
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();

        // pass userId and departmentId into token
        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole().name(),
            user.getId(),
            user.getDepartmentId()
        );

        return ResponseEntity.ok(Map.of(
            "token", token,
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "userId", user.getId(),
            "departmentId", user.getDepartmentId() != null ? user.getDepartmentId() : 0L
        ));
    }

}
