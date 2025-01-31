# Software Requirements Document

## 1. Introduction
**App Name**: To Be Confirm  
**Purpose**: <br>
(1) This app allows users to check the availability of parking lots in different areas using their smartphones <br>
(2) This app allows third party application to request parking lots latest statistic like occupied or empty spots count

## 2. Functional Requirements
### 2.1 User Authentication
- Users can **sign up** and **log in** using email and password.
- Allowing users to  **reset their password** through email.

### 2.2 Parking Lot Selection
- Users can **search for a specific area** to check available parking.
- Users can **view a map** with real-time parking availability.

### 2.3 Real-Time Parking Status
- The app will show **"Occupied" or "Available"** status for each parking spot.

### 2.4 Admin Features
- Parking lot owners can **update** parking availability.
- Admins can **update** the lot sizes, **modify** the availability or **post** some notices

## 3. Non-Functional Requirements
### 3.1 Performance
- The app should **load parking lot data within 10 seconds**.
- Support **at least 10 concurrent users** without performance degradation.
- The website is flexible for mobile and PC

### 3.2 Scalability
- The system should be **Able** to add new parking site efficiently.
- Cloud-based infrastructure to support **dynamic scaling**.

### 3.3 Security
- **End-to-end encryption** for user data.
- Only authorized admins can **modify parking lot data**.

### 3.4 Reliability
- **99.9% uptime guarantee** to ensure app availability.
- Each Request will be handled individually thread to ensure efficient processing

### 3.5 Maintainability
- The system should support **easy updates and bug fixes**..
- AI models, trained using Roboflow, will detect empty or occupied spots for real-time accuracy.

## 4. Conclusion
This document outlines the **functional and non-functional requirements** for the smart parking app. It ensures a seamless user experience with real-time parking status updates, intuitive UI, and secure access. Future improvements may include booking options and AI-based parking predictions.

---
**Last Updated**: [2025-01-28]