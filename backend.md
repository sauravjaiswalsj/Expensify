# Expensify.ai - Backend Features Documentation

## Overview

Expensify.ai Backend is a comprehensive **Spring Boot REST API** designed to manage user authentication and expense tracking. Built with security, scalability, and reliability in mind, it uses **MongoDB** for data persistence and **JWT** for secure token-based authentication.

---

## ✅ Fully Implemented Features

### 1. **"User Authentication & Authorization**

####" User Registration (Sign Up)
- **Endpoint:** `POST /auth/signup`
- **Features:**
  - Create new user accounts with validation
  - Input validation for username, email, and password
  - Username must be 4-20 characters with alphanumeric, dots, underscores, and hyphens
  - Email validation for valid email format
  - Password strength requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character (@$!%*?&)
  - Unique constraint checks for username and email
  - Automatic verification code generation and sending
  - Account created in unverified state
  - Returns appropriate HTTP status codes for conflicts and validation errors

#### User Login
- **Endpoint:** `POST /auth/login`
- **Features:**
  - Authenticate users with username and password
  - Validation that account is verified before login
  - JWT token generation with configurable expiration
  - Returns token and expiration time on successful login
  - Exception handling for:
    - Invalid credentials (401 Unauthorized)
    - Unverified accounts (403 Forbidden)
    - User not found (404 Not Found)
    - Internal server errors (500)

#### Email Verification
- **Endpoint:** `POST /auth/verify`
- **Features:**
  - Verify user accounts using verification codes sent to email
  - Verification code expiration validation (time-based)
  - Prevention of duplicate verification attempts
  - Proper error handling for:
    - Expired verification codes (403 Forbidden)
    - Incorrect verification codes (401 Unauthorized)
    - Already verified users (409 Conflict)
    - User not found (404 Not Found)
  - Account marked as verified only after successful verification

#### Verification Code Resend
- **Endpoint:** `POST /auth/resend?username={username}`
- **Features:**
  - Resend verification codes to registered email
  - Prevents resending for already verified accounts
  - Generates new verification codes with new expiration times
  - User-friendly error messages
  - Validation for user existence

#### Password Management

##### Initiate Password Reset
- **Endpoint:** `POST /auth/forget?username={username}`
- **Features:**
  - Generate password reset tokens for forgotten passwords
  - Send reset codes to user's registered email
  - Verification code expiration tracking
  - Error handling for non-existent users

##### Complete Password Reset
- **Endpoint:** `POST /auth/forget/newPassword`
- **Features:**
  - Reset password with verification code validation
  - Requires username, new password, and verification code
  - Password validation against strength requirements
  - Prevents resetting for already verified password scenarios
  - Secure password update in database

---

### 2. **Expense Management**

#### Add Expense
- **Endpoint:** `POST /add`
- **Features:**
  - Create and record new expenses for authenticated users
  - Authentication verification required
  - Expense data validation:
    - Amount must be greater than 0
    - Expense cannot be null
  - Support for multiple expense properties:
    - Amount (numeric)
    - Currency (INR, USD, EUR, JPY, GBP, AUD, CAD, CHF, CNY, SEK, NZD)
    - Category (user-defined or predefined)
    - Description (optional)
    - Payment type (Cash, Card, Check, Digital Wallet, etc.)
    - Date of transaction (flexible date handling)
  - Automatic timestamp generation (createdAt, updatedAt)
  - Association with authenticated user
  - Response includes status and detailed feedback

#### Supported Currencies
- **INR** - Indian Rupee
- **USD** - United States Dollar
- **EUR** - Euro
- **JPY** - Japanese Yen
- **GBP** - British Pound Sterling
- **AUD** - Australian Dollar
- **CAD** - Canadian Dollar
- **CHF** - Swiss Franc
- **CNY** - Chinese Yuan Renminbi
- **SEK** - Swedish Krona
- **NZD** - New Zealand Dollar

---

### 3. **Data Models & Database Schema**

#### User Model
```
- _id (MongoDB ObjectId)
- username (unique, indexed, 4-20 chars)
- email (unique, indexed, email format)
- firstName (required)
- lastName (required)
- password (hashed, strong requirements)
- role (USER/ADMIN)
- isAccountVerified (boolean)
- verificationCode (randomly generated)
- verificationCodeExpiresAt (timestamp)
- expenses (DBRef to Expense collection)
- createdAt (timestamp)
- updatedAt (timestamp)
```

#### Expense Model
```
- _id (MongoDB ObjectId)
- username (indexed)
- amount (double, required)
- currency (enum)
- category (string)
- description (optional string)
- paymentType (string)
- date (transaction date)
- user (DBRef to User)
- createdAt (timestamp)
- updatedAt (timestamp)
```

---

### 4. **Security Features**

#### JWT Authentication
- Token-based authentication
- Configurable token expiration
- Secure token generation and validation
- Bearer token format for API requests

#### Password Security
- Bcrypt hashing for password storage
- Strong password requirements enforced
- Password reset capability with verification

#### CORS Configuration
- Cross-Origin Resource Sharing enabled
- Pre-configured for frontend communication
- Secure origin policies

#### Request Validation
- Input validation using Jakarta Validation
- Constraint annotations for data integrity
- Pattern matching for username and password

---

### 5. **API Response Format**

#### Standard Response Structure
```json
{
  "success": boolean,
  "data": object or null,
  "header": {
    "message": string,
    "httpResponseStatus": HttpStatus,
    "responseTime": timestamp
  }
}
```

#### Status Codes
- **200 OK** - Successful GET/POST request
- **201 Created** - Successful resource creation
- **400 Bad Request** - Invalid input or validation failure
- **401 Unauthorized** - Authentication failure or invalid token
- **403 Forbidden** - Access denied or unverified account
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate user or resource conflict
- **500 Internal Server Error** - Server error

---

### 6. **Exception Handling**

Comprehensive exception handling with specific error scenarios:

- **UserAlreadyExistsException** - When username or email already registered
- **InvalidUserException** - Invalid user data
- **InvalidEmailException** - Invalid email format
- **InvalidUserLengthException** - Username length constraints violated
- **UserNotFoundException** - User doesn't exist
- **UserNotVerifiedException** - Account not verified before login
- **UserAlreadyVerifiedException** - Already verified account operations
- **VerificationCodeExpiredException** - Expired verification code
- **VerificationCodeIncorrectException** - Wrong verification code
- **InvalidExpenseException** - Invalid expense data
- **IncorrectPasswordException** - Wrong password entered
- **InvalidPasswordException** - Password doesn't meet requirements
- **GlobalExceptionHandler** - Centralized exception handling

---

### 7. **Configuration & Infrastructure**

#### Database
- **MongoDB** for document storage
- Indexed fields for performance optimization
- DBRef for relationships between collections

#### Email Service
- SMTP configuration for verification codes
- Email verification for account creation
- Password reset email delivery
- Verification code expiration management

#### Security Configuration
- SecurityConfig for Spring Security setup
- JWT authentication filter
- Role-based authorization framework

#### Transaction Management
- Transactional operations for data consistency
- Automatic transaction handling

---

### 8. **Utility Features**

#### Code Generation & Utilities
- Verification code generation
- Current time tracking utilities
- Input validation helpers

#### User Retrieval
- **Endpoint:** `GET /auth/users`
- Retrieve list of all registered users (development/debugging)

---

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/verify` | Verify user account | No |
| POST | `/auth/resend` | Resend verification code | No |
| POST | `/auth/forget` | Initiate password reset | No |
| POST | `/auth/forget/newPassword` | Complete password reset | No |
| POST | `/add` | Add new expense | Yes (JWT) |
| GET | `/auth/users` | Get all users | No |

---

## 🔧 Technology Stack

- **Framework:** Spring Boot 3.x
- **Language:** Java 17+
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Jakarta Validation
- **ORM:** Spring Data MongoDB
- **API Documentation:** Swagger/SpringDoc OpenAPI
- **Logging:** SLF4J with Logback
- **Build Tool:** Maven
- **Deployment:** Containerized (Docker ready)

---

## 📊 Database Indexes

- **User Collection:**
  - `username` (unique)
  - `email` (unique)

- **Expense Collection:**
  - `username` (indexed)
  - Compound indexes on (username, date) for queries

---

## 🚀 Key Implementation Highlights

1. **Stateless Authentication** - JWT tokens eliminate session storage needs
2. **Email Verification** - Two-step verification for account security
3. **Flexible Expense Tracking** - Support for multiple currencies and categories
4. **Comprehensive Validation** - Input validation at controller and model layers
5. **Error Handling** - Specific exceptions with meaningful error messages
6. **MongoDB Integration** - Scalable document storage with flexible schema
7. **Security First** - Password hashing, JWT tokens, CORS configuration
8. **RESTful Design** - Standard HTTP methods and status codes

---

## 🔐 Security Best Practices Implemented

✅ Password hashing with Bcrypt  
✅ JWT token-based authentication  
✅ Email verification for new accounts  
✅ Password recovery with verification codes  
✅ Input validation and sanitization  
✅ CORS policy configuration  
✅ Role-based authorization ready  
✅ Verification code expiration  
✅ Unique constraint enforcement  
✅ Secure password requirements  

---

## 📝 Notes for Future Development

- Report generation for expense analytics
- Expense filtering and search capabilities
- Budget management and alerts
- CSV export functionality
- Expense categories management
- Multi-currency conversion
- Recurring expenses
- Expense sharing between users
- Advanced analytics and dashboards
- Push notifications for budget alerts

---

**Last Updated:** April 26, 2026  
**Version:** 1.0 - MVP Release

