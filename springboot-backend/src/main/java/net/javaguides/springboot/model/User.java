package net.javaguides.springboot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "email", nullable = false, unique = true)
	private String email;
	
	@Column(name = "password", nullable = false)
	private String password;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 50)
	private Role role;
	
	@Column(name = "department_id")
    private Long departmentId;
	
	public enum Role{
		ADMIN, SUPERVISOR, EMPLOYEE, USER
	}
	
	 public User() {}

	    public User(String email, String password, Role role, Long departmentId) {
	        this.email = email;
	        this.password = password;
	        this.role = role;
	        this.departmentId = departmentId;
	    }
	    
	    public Long getId() { return id; }
	    public String getEmail() { return email; }
	    public void setEmail(String email) { this.email = email; }
	    public String getPassword() { return password; }
	    public void setPassword(String password) { this.password = password; }
	    public Role getRole() { return role; }
	    public void setRole(Role role) { this.role = role; }
	    public Long getDepartmentId() { return departmentId; }
	    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

}
