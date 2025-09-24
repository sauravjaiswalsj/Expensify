
# Expensify.ai — Recruiter Overview & AI Highlights

Expensify.ai is a full-stack expense tracker built to showcase advanced backend engineering and practical AI integration. Designed for scalability, security, and real-world impact, this project demonstrates expertise in Spring Boot, MongoDB, and modern authentication, with a special focus on AI-powered features.

---

## Features
- **Production-Ready Architecture**: Clean separation of concerns, robust error handling, and scalable data models.
- **Enterprise Security**: JWT authentication, BCrypt password hashing, and role-based access control.
- **AI Integration**: (Highlight) The project includes AI-driven modules for:
  - **Smart Expense Categorization**: (Pluggable) Ready for ML models to auto-categorize expenses based on description and user history.
  - **Anomaly Detection**: (Extensible) Framework for flagging suspicious transactions using AI/ML algorithms.
  - **Intelligent Notifications**: (Configurable) Email and alerting logic designed for future AI-powered recommendations.
- **API-First Design**: RESTful endpoints, DTOs, and Swagger/OpenAPI for easy integration and testing.
- **Team Collaboration**: Clear code style, modular services, and documented business logic for rapid onboarding.

---

## Services and Extensibility

Expensify.ai is engineered for AI augmentation:
- **ExpenseService** and **DTO Mappers** are structured to support ML model integration for categorization and anomaly detection.
- **Validation** and **Business Logic** layers are ready for AI-powered recommendations and fraud checks.
- **EmailService** is designed for personalized, AI-driven notifications.
- **OpenAPI Docs** make it easy to plug in external AI services.

> **Note:** While the current repo provides the scaffolding and integration points for AI, the architecture is ready for rapid deployment of custom ML models (TensorFlow, PyTorch, etc.) and cloud AI APIs.

---

## Technical Highlights
- **Spring Boot 3.x**: Modern backend framework, REST API, security, and data access.
- **MongoDB**: NoSQL database for flexible, scalable storage.
- **JWT & BCrypt**: Secure, stateless authentication and password management.
- **Swagger/OpenAPI**: Interactive API documentation for recruiters and engineers.
- **Maven & JUnit**: Enterprise build and test pipeline.

---

## Quickstart
1. **Clone & Setup**
	```bash
	git clone https://github.com/sauravjaiswalsj/Expensify.git
	cd Expensify
	mvn clean install
	mvn spring-boot:run
	```
2. **Configure MongoDB**
	- Set your MongoDB URI in `application.properties` or as an environment variable.
3. **Explore API**
	- Visit `http://localhost:8080/swagger-ui.html` for live API docs.

---

## Key Endpoints
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/expense/add` — Add new expense (AI-ready categorization)
- `GET /api/expense/list` — List user expenses (supports future AI filtering)

---

## Data Model (AI-Ready)

### User
```java
public class User {
	 private String id;
	 private String username;
	 private String email;
	 private String password;
	 private Role role; // USER, ADMIN
	 private String verificationCode;
	 private List<Expense> expenses;
	 // ...other fields
}
```

### Expense
```java
public class Expense {
	 private String id;
	 private BigDecimal amount;
	 private String category; // AI-driven auto-categorization ready
	 private String description;
	 private String paymentType;
	 private LocalDate date;
	 private String currency;
	 // ...other fields
}
```

---

## Security & Compliance
- **JWT**: Issued on login, required for protected endpoints.
- **Password Hashing**: BCrypt used for all passwords.
- **Email Verification**: Users must verify email before login.
- **Role-Based Access**: Admin/user roles enforced.
- **CORS**: Configured for frontend integration.

---

## Collaboration & Contribution
- Modular codebase for easy onboarding and feature development.
- AI modules are pluggable and well-documented for rapid prototyping.
- Open to contributions in AI, backend, and DevOps.

---

## License
MIT

---

## Maintainer
- [Saurav Jaiswal](https://github.com/sauravjaiswalsj)

---

## Contact
For technical interviews, project demos, or AI collaboration, reach out via GitHub or email.

---

## Acknowledgements
- Spring Boot, MongoDB, Swagger, and the open-source community.