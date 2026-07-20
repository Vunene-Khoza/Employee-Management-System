package net.javaguides.springboot.repository;

import net.javaguides.springboot.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Boolean existsByName(String name);
    Optional<Department> findBySupervisorId(Long supervisorId);
    Optional<Department> findByName(String name);
}
