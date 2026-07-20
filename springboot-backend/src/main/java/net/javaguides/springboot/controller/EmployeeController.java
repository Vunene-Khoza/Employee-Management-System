package net.javaguides.springboot.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.excpetion.ResourceNotFoundException;
import net.javaguides.springboot.model.Employee;
import net.javaguides.springboot.repository.EmployeeRepository;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class EmployeeController {
	
	@Autowired
	private EmployeeRepository employeeRepository;
	
    // ADMIN only — get all employees
    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(employeeRepository.findAll());
    }
    // ADMIN + SUPERVISOR + EMPLOYEE — get employees by department
    @GetMapping("/employees/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(employeeRepository.findByDepartmentId(departmentId));
    }
    // ADMIN + SUPERVISOR + EMPLOYEE — create employee
    @PostMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public Employee createEmployee(@RequestBody Employee employee) {
        // Auto-assign random Field
        String[] fields = {"Human Resource", "Marketing", "Education", "Information Technology", "Engineering", "Law"};
        Random random = new Random();
        employee.setField(fields[random.nextInt(fields.length)]);

        // Auto-assign random Start Date within the last 7 years
        int daysToSubtract = random.nextInt(365 * 7);
        employee.setStartDate(LocalDate.now().minusDays(daysToSubtract));

        return employeeRepository.saveAndFlush(employee);
    }
    // ADMIN + SUPERVISOR — get employee by id
    @GetMapping("/employees/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Employee Has This Id: " + id));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(employee);
    }
    // get employee by user id (for EMPLOYEE to view own profile)
    @GetMapping("/employees/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'EMPLOYEE')")
    public ResponseEntity<Employee> getEmployeeByUserId(@PathVariable Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No Employee linked to User Id: " + userId));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(employee);
    }
    // ADMIN + SUPERVISOR — update employee
    @PutMapping("/employees/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employeeDetails) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Employee Has This Id: " + id));

        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setEmailId(employeeDetails.getEmailId());
        employee.setPhoneNumber(employeeDetails.getPhoneNumber());
        employee.setAddress(employeeDetails.getAddress());
        employee.setDateOfBirth(employeeDetails.getDateOfBirth());
        employee.setDepartmentId(employeeDetails.getDepartmentId());
        if (employeeDetails.getUserId() != null) {
            employee.setUserId(employeeDetails.getUserId());
        }
        if (employeeDetails.getProfilePicture() != null) {
            employee.setProfilePicture(employeeDetails.getProfilePicture());
        }

        return ResponseEntity.ok(employeeRepository.saveAndFlush(employee));
    }
    // ADMIN + SUPERVISOR — delete employee
    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Map<String, Boolean>> deleteEmployee(@PathVariable Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Employee Has This Id: " + id));

        employeeRepository.delete(employee);
        employeeRepository.flush();
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
    
}
