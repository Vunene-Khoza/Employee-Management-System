package net.javaguides.springboot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "employees")

public class Employee {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)

	private long id;
	@Column(name = "first_name")
	private String firstName;
	
	@Column(name = "last_name")
	private String lastName;
	
	@Column(name = "email_id")
	private String emailId;
	
	@Column(name = "phone_number")
	private String phoneNumber;
	
	@Column(name = "address")
	private String address;
	
	@Column(name = "date_of_birth")
	private String dateOfBirth;
	
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "user_id", unique = true)
    private Long userId;

	@Lob
	@Column(name = "profile_picture", columnDefinition = "LONGTEXT")
	private String profilePicture;

	@Column(name = "field")
	private String field;

	@Column(name = "start_date")
	private LocalDate startDate;
	
	public Employee() {
		
	}
	
	
	
	public Employee(String firstName, String lastName, String emailId, String phoneNumber, String address, String dateOfBirth, Long departmentId, Long userId, String profilePicture) {
		super();
		this.firstName = firstName;
		this.lastName = lastName;
		this.emailId = emailId;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.departmentId = departmentId;
        this.userId = userId;
		this.profilePicture = profilePicture;
	}
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getEmailId() {
		return emailId;
	}
	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getDateOfBirth() {
		return dateOfBirth;
	}
	public void setDateOfBirth(String dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}
    public Long getDepartmentId() { 
    	return departmentId; 
    }
    public void setDepartmentId(Long departmentId) { 
    	this.departmentId = departmentId; 
    }

    public Long getUserId() { 
    	return userId; 
    }
    public void setUserId(Long userId) { 
    	this.userId = userId; 
    }

	public String getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(String profilePicture) {
		this.profilePicture = profilePicture;
	}

	public String getField() {
		return field;
	}

	public void setField(String field) {
		this.field = field;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}
}
