Here is the updated **README.md** file, revised to include the specific shell commands, environment fixes for the **P1013** error, and the modern **System Logs** architecture.

---

# 🎓 Institute Management System (IMS) - 2026

A comprehensive full-stack platform for academic administration, featuring automated **Cloudinary** media management, **Prisma/MongoDB** data persistence, and enhanced **Security Audit Logging**.

## 🛠️ Tech Stack

* **Frontend:** React (SCSS with CSS Variables)
* **Backend:** Node.js, Express, TypeScript
* **Database:** MongoDB Atlas via Prisma ORM
* **Storage:** Cloudinary

---

## 🚀 Step-by-Step Setup

### 1. Environment Configuration

Create a `.env` file in the `server/` directory. **Crucial:** You must include the database name in the URL to prevent the **P1013** error encountered during setup.

```env
PORT=5000
# Ensure /school_management (or your db name) is present before the '?'
DATABASE_URL="mongodb+srv://anoopprakash:Anoop123@cluster1.qyhgdsu.mongodb.net/school_management?retryWrites=true&w=majority"
JWT_SECRET=your_secret_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

```

### 2. Backend Initialization

Execute these commands in the `server/` terminal to synchronize the schema and generate types for the new security audit fields (`ipAddress` and `userId`).

```bash
# 1. Install dependencies
npm install

# 2. Clear old SQL migration history (fixes P3019 provider mismatch)
rm -rf prisma/migrations

# 3. Generate Prisma Client with updated relations (studentProfile, teacherProfile)
npx prisma generate

# 4. Sync schema with MongoDB Atlas (DNS resolution fix)
npx prisma db push

# 5. Seed the database with default roles and Super Admin
npx prisma db seed

```

### 3. Frontend Initialization

```bash
cd ../client
npm install
npm start

```

---

## 🛡️ Security & Auditing Features

* **Forensic Audit Logs:** Every `CREATE` or `DELETE` action captures the administrator's **IP Address** and **User ID** for accountability.
* **Automated Media Cleanup:** Deleting a user profile automatically triggers a Cloudinary API call to remove the associated avatar, preventing "ghost" files.
* **Modern Activity Feed:** The System Logs page uses a chronological card-based design with "tech-style" tags for network metadata.

---

## 🧩 Common Troubleshooting

| Issue | Resolution |
| --- | --- |
| **Error P1013** | Add `/your_db_name` to your `DATABASE_URL` string. |
| **DNS Resolution Error** | Ensure port 27017 is open and your IP is whitelisted in Atlas. |
| **TS Property 'student' not found** | Use `studentProfile` as defined in the updated `schema.prisma`. |
| **Theme Mismatch** | Ensure `_themes.scss` is imported to provide the required CSS variables. |

---

**Would you like me to help you create a `deployment.yml` file to automate this entire setup process using GitHub Actions?**
