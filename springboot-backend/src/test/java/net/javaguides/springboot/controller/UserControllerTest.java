package net.javaguides.springboot.controller;

import net.javaguides.springboot.repository.UserRepository;
import net.javaguides.springboot.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String getAdminToken() {
        return "Bearer " + jwtUtil.generateToken("admin@example.com", "ADMIN", 1L, null);
    }

    @Test
    public void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                .header("Authorization", getAdminToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetSupervisors() throws Exception {
        mockMvc.perform(get("/api/v1/users/supervisors")
                .header("Authorization", getAdminToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateUser() throws Exception {
        String userJson = "{\"email\":\"testuser@example.com\",\"password\":\"password123\",\"role\":\"EMPLOYEE\"}";
        mockMvc.perform(post("/api/v1/users")
                .header("Authorization", getAdminToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isOk());
        
        // Clean up
        userRepository.findByEmail("testuser@example.com").ifPresent(user -> userRepository.delete(user));
    }
}
