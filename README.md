# Employee Management System

A full-stack **CRUD** application for managing employee records.

- **Frontend**: Angular (standalone components, modern Angular 17+ style)
- **Backend**: Spring Boot (REST API with JPA/Hibernate + MySQL)
- **Database**: MySQL
- **Styling**: Bootstrap 5

## Features

- List all employees
- Add new employee
- Update existing employee
- Delete employee
- Basic form validation
- Responsive design with Bootstrap

## Prerequisites

- Node.js 18+ & npm
- Angular CLI (`npm install -g @angular/cli`)
- Java 17+ & Maven

## Setup Instructions

### 1. Backend (Spring Boot)

# MySQL connection settings
spring.datasource.url=jdbc:mysql://localhost:3306/database_name?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
### 2. Frontend (Angular)

- Create angular-frontend
`ng new angular-frontend`
- Navigate to folder
`cd .\angular-frontend\`
-(Optional) Install Bootstrap locally
`npm install bootstrap@5.3.8`
-Start the Angular development server
`ng serve`

