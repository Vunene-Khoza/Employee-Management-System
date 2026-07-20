package net.javaguides.springboot.controller;

import net.javaguides.springboot.repository.EmployeeRepository;
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
public class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String getAdminToken() {
        return "Bearer " + jwtUtil.generateToken("admin@example.com", "ADMIN", 1L, null);
    }

    @Test
    public void testGetAllEmployees() throws Exception {
        mockMvc.perform(get("/api/v1/employees")
                .header("Authorization", getAdminToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateEmployee() throws Exception {
        String empJson = "{\"firstName\":\"Test\",\"lastName\":\"User\",\"emailId\":\"testemp@example.com\",\"phoneNumber\":\"1234567890\",\"address\":\"Test Address\",\"dateOfBirth\":\"1990-01-01\",\"departmentId\":1}";
        mockMvc.perform(post("/api/v1/employees")
                .header("Authorization", getAdminToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(empJson))
                .andExpect(status().isOk());
        
        // Clean up
        employeeRepository.findByEmailId("testemp@example.com").ifPresent(emp -> employeeRepository.delete(emp));
    }

}
