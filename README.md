# Employee Management System (EMS)
### Enterprise Workforce Management & Task Orchestration

![Status](https://img.shields.io/badge/Status-Development-orange?style=flat-square)
![Backend](https://img.shields.io/badge/Backend-FastAPI_Python-009688?style=flat-square&logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT_OTP-BC3939?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML_JS_CSS-blue?style=flat-square&logo=javascript&logoColor=white)

**EMS** is a high-performance administrative platform built using FastAPI and MongoDB. It provides a robust backend for managing organizational hierarchies, enabling managers to delegate tasks effectively while allowing employees to track their professional growth in real-time.

## Key Features

### Authentication & Authorization
* **Dual-Method Login:** Support for traditional Email/Password and secure OTP-based email verification.
* **JWT Security:** Stateless session management using Bearer token authentication.
* **RBAC (Role-Based Access Control):** Granular access levels for Admin, Manager, and Employee roles.
* **Session Integrity:** Database-backed token tracking to ensure secure logout and access management.

### Managerial Suite
* **Resource Overview:** Comprehensive view of all employees within the organization's database.
* **Task Delegation:** Assign tasks to specific employees using their email identifiers.
* **Workflow Control:** Set metadata including task priority, deadlines, and detailed descriptions.
* **Quality Assurance:** Ability to add comments and reviews to tasks to track progress and provide feedback.

### Employee Experience
* **Personal Dashboard:** Real-time visibility into assigned tasks, upcoming deadlines, and manager feedback.
* **Task Lifecycle:** Direct updates to task status (Not Started ➔ In Progress ➔ Completed).
