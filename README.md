# IMS Pro: Unified Institutional Management System

**IMS Pro** is a professional-grade Institutional Management System (IMS) designed to digitize and unify educational operations. From student admissions and academic tracking to complex hostel allocations and financial management, this platform provides a seamless digital ecosystem for administrators, teachers, and students.

---

## 🚀 Key Features

### 🏢 Administrative & Staff

* **Secure Admission Portal:** Streamlined student registration with automated Admission ID generation and profile image cropping.
* **Hostel Management:** Create blocks, manage room capacities, and track real-time occupancy rates through interactive analytics.
* **System Audit Logs:** A comprehensive security trail tracking every administrative action (Create, Update, Delete) to ensure accountability.
* **Role-Based Access Control (RBAC):** Granular permissions for Super Admins, Administrators, and Wardens with strict role normalization.

### 🎓 Student Portal

* **Digital Admit Cards:** View upcoming exam schedules, subjects, and semesters in a clean, printable format.
* **Academic Tracking:** Self-service access to attendance statistics, exam results, and subject lists.
* **Finance & Invoicing:** Real-time view of fee records and payment status.

---

## 🛠️ Tech Stack

* **Frontend:** React (TypeScript), SCSS (Modern Glassmorphism Design), Material UI.
* **Backend:** Node.js, Express.js (TypeScript).
* **Database:** MySQL with **Prisma ORM**.
* **Authentication:** JWT (JSON Web Tokens) and Bcrypt.js password hashing.

---

## 💻 Installation Guide

### Prerequisites

* Node.js (v16+)
* MySQL Server
* npm or yarn

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd ims-pro

```

### Step 2: Backend Configuration

1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the root of the server folder:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ims_db"
JWT_SECRET="your_highly_secure_secret"
PORT=5000

```


4. **Database Setup:**
```bash
npx prisma migrate dev --name init
npx prisma generate

```



### Step 3: Frontend Configuration

1. Navigate to the client directory: `cd ../client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## 🏗️ Project Structure

* **`server/prisma/schema.prisma`**: The core data blueprint defining 20+ models including Students, Teachers, Exams, and Hostel Admissions.
* **`server/src/middlewares/auth.ts`**: The security gateway that normalizes roles (e.g., "SUPER ADMIN" vs "super_admin") to prevent unauthorized access.
* **`client/src/pages/admin/hostel/`**: Contains the responsive hostel student directory which utilizes a "Card-Switch" design for mobile devices.

---

## 🛡️ Role Normalization Note

To ensure the system remains robust across different operating systems and database configurations, the system uses **Strict Role Normalization**.

* All roles are converted to **UPPERCASE**.
* Underscores (`_`) are automatically replaced with **Spaces** ( ).
* *Example:* `super_admin` becomes `SUPER ADMIN` during validation.

---

## 📧 Support

For system logs verification or troubleshooting 403 Forbidden errors, please refer to the **System Audit Logs** page to identify which administrative account performed the action.

---

Would you like me to add a section for **API Documentation** detailing the specific endpoints for the Student Portal?


npm install qrcode.react