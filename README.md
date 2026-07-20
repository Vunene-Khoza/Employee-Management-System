# Full-Stack Employee Management System with AI HR Assistant

A modern, full-stack enterprise management application built with **Spring Boot**, **Angular**, **MySQL**, and integrated with **Google Gemini AI** (`gemini-2.5-flash`).

---

## 🚀 Key Features

* **Employee & Department Management:** Full CRUD operations to track employee records, job roles, departments, and user profiles.
* **Role-Based Access Control (RBAC):** Secured with **Spring Security** and **JWT (JSON Web Tokens)** to govern Admin, User, and Supervisor permissions.
* **AI HR Assistant:** Stateful chat assistant integrated via **Google Gemini API** (`gemini-2.5-flash`) using OpenAI compatibility layer to assist users with HR and policy inquiries.
* **Modern Reactive UI:** Angular frontend with route guards, HTTP interceptors, and sweet alert notification popups.

---

## 🛠️ Technology Stack

- **Backend:** Java 17+, Spring Boot 4.0+, Spring Data JPA, Spring Security, JWT (`jjwt 0.12.6`), Lombok, Maven
- **Frontend:** Angular 19+, TypeScript, RxJS, HTML5/CSS3, SweetAlert2
- **Database:** MySQL
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) via OpenAI Compatibility Layer

---

## 📁 Repository Structure

```text
├── springboot-backend/    # Spring Boot REST API Backend
└── angular-frontend/      # Angular SPA Frontend
```

---

## ⚙️ Getting Started

### Prerequisites
- **JDK 17+**
- **Node.js 18+** & **npm**
- **MySQL Server** (running locally on default port 3306)

### 1. Backend Setup (`springboot-backend`)
1. Navigate to the backend directory:
   ```bash
   cd springboot-backend
   ```
2. Update `src/main/resources/application.properties` with your MySQL credentials and Google Gemini API Key:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.ai.openai.api-key=YOUR_GEMINI_API_KEY
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend server runs on `http://localhost:8080`.

### 2. Frontend Setup (`angular-frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd angular-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:4200`.

---

## 📝 License
This project is open source under the [MIT License](LICENSE).
