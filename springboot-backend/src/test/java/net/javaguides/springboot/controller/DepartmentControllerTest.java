package net.javaguides.springboot.controller;

import net.javaguides.springboot.repository.DepartmentRepository;
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
public class DepartmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String getAdminToken() {
        return "Bearer " + jwtUtil.generateToken("admin@example.com", "ADMIN", 1L, null);
    }

    @Test
    public void testGetAllDepartments() throws Exception {
        mockMvc.perform(get("/api/v1/departments")
                .header("Authorization", getAdminToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateDepartment() throws Exception {
        String deptJson = "{\"name\":\"Test Department\"}";
        mockMvc.perform(post("/api/v1/departments")
                .header("Authorization", getAdminToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(deptJson))
                .andExpect(status().isOk());
        
        // Clean up
        departmentRepository.findByName("Test Department").ifPresent(dept -> departmentRepository.delete(dept));
    }
}
