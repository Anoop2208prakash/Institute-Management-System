🎓 Institute Management System (IMS) - 2026A comprehensive full-stack platform for academic administration, featuring automated Cloudinary media management, Prisma/MongoDB data persistence, and enhanced Security Audit Logging.🛠️ Tech StackFrontend: React (SCSS with CSS Variables)Backend: Node.js, Express, TypeScriptDatabase: MongoDB Atlas via Prisma ORMStorage: Cloudinary🚀 Step-by-Step Setup1. Environment ConfigurationCreate a .env file in the server/ directory. Crucial: You must include the database name in the URL to prevent the P1013 error encountered during setup.Code snippetPORT=5000
# Ensure /school_management (or your db name) is present before the '?'
DATABASE_URL="mongodb+srv://anoopprakash:Anoop123@cluster1.qyhgdsu.mongodb.net/school_management?retryWrites=true&w=majority"
JWT_SECRET=your_secret_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
2. Backend InitializationExecute these commands in the server/ terminal to synchronize the schema and generate types for the new security audit fields (ipAddress and userId).Bash# 1. Install dependencies
npm install

# 2. Clear old SQL migration history (fixes P3019 provider mismatch)
rm -rf prisma/migrations

# 3. Generate Prisma Client with updated relations (studentProfile, teacherProfile)
npx prisma generate

# 4. Sync schema with MongoDB Atlas (DNS resolution fix)
npx prisma db push

# 5. Seed the database with default roles and Super Admin
npx prisma db seed
3. Frontend InitializationBashcd ../client
npm install
npm start
🛡️ Security & Auditing FeaturesForensic Audit Logs: Every CREATE or DELETE action captures the administrator's IP Address and User ID for accountability.Automated Media Cleanup: Deleting a user profile automatically triggers a Cloudinary API call to remove the associated avatar, preventing "ghost" files.Modern Activity Feed: The System Logs page uses a chronological card-based design with "tech-style" tags for network metadata.🧩 Common TroubleshootingIssueResolutionError P1013Add /your_db_name to your DATABASE_URL string.DNS Resolution ErrorEnsure port 27017 is open and your IP is whitelisted in Atlas.TS Property 'student' not foundUse studentProfile as defined in the updated schema.prisma.Theme MismatchEnsure _themes.scss is imported to provide the required CSS variables.