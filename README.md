# Smart Lost and Found System

A web-based Smart Lost and Found application developed as a DBMS Level 3 project. The system helps students report lost and found belongings, discover possible matches, submit ownership claims and receive notifications. Administrators can review claims, investigate reported listings and manage item collection.

## 1. Project Overview

The Smart Lost and Found System addresses the difficulty of recovering misplaced belongings in a campus environment.

Students can:
- Register and log in securely.
- Report lost items.
- Report found items.
- View possible lost-and-found matches.
- Submit ownership claims with proof descriptions.
- Receive notifications about claim decisions.
- Save searches and receive relevant alerts.

Administrators can:
- Review student claims.
- Approve or reject claims.
- Review reports about suspicious listings.
- Manage the physical collection of approved items.
- View activity and analytics.

## 2. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | Next.js and React | Web pages and interactive components |
| Backend/API | Next.js Route Handlers | Request processing and business logic |
| Programming language | JavaScript | Application and matching logic |
| Relational database | MySQL | Structured application records and relationships |
| NoSQL database | MongoDB | Activity history, audit logs, saved searches and alerts |
| MySQL driver | mysql2 | MySQL connectivity |
| MongoDB driver | mongodb | MongoDB connectivity |
| Authentication | bcryptjs and signed sessions | Password hashing and session management |

## 3. System Architecture

The project uses three logical layers:

1. **Presentation layer:** Next.js pages and React components display information and collect user input.
2. **Application layer:** Next.js API routes handle validation, authentication, matching and application operations.
3. **Data layer:** MySQL stores structured relational data, while MongoDB stores flexible activity and history documents.

Some Next.js server components also retrieve data directly from MySQL using the database connection module.

## 4. Database Design

### MySQL

Database name: `smart_lost_found`

The relational database contains these main tables:

| Table | Purpose |
|---|---|
| `users` | Student and administrator accounts |
| `locations` | Campus locations |
| `lost_items` | Lost-item reports |
| `found_items` | Found-item reports |
| `matches` | Possible lost/found matches and similarity scores |
| `claims` | Ownership claims and decisions |
| `notifications` | User notifications |
| `reports` | Reports about found-item listings |

The database also contains the view `vw_match_details`.

Primary keys, foreign keys, unique constraints, NOT NULL constraints, defaults and CHECK constraints help maintain data integrity.

### MongoDB

Database name: `smart_lost_found_logs`

MongoDB is used for flexible application records, including:
- Activity logs
- Item history
- Administrator audit logs
- Saved searches
- Saved-search alerts

## 5. Matching System

The application uses a weighted rule-based matching algorithm implemented in `lib/matching.js`.

The matching algorithm considers:

| Attribute | Weight |
|---|---:|
| Item name | 40% |
| Category | 20% |
| Colour | 15% |
| Brand | 15% |
| Description | 10% |

The matching API evaluates candidate lost-item records and creates a match when the matching rules and configured score threshold are satisfied.

The similarity score is stored in the MySQL `matches` table.

## 6. Advanced Database Concepts

The project demonstrates multiple database concepts:

- **DDL and integrity constraints:** Table definitions, primary keys, foreign keys, unique constraints and CHECK constraints.
- **DML and CRUD:** INSERT, SELECT, UPDATE and DELETE operations.
- **JOIN queries:** Retrieve related information from multiple relational tables.
- **Nested and correlated subqueries:** Filter records based on related matches and claims.
- **Transactions:** Group related database changes and use commit/rollback handling.
- **Triggers:** Automatically create notifications after matching events.
- **Stored procedures:** The `ProcessClaim` procedure handles claim status updates.
- **Views:** `vw_match_details` combines match and user information.
- **Indexes:** Support relevant database searches.
- **MongoDB aggregation:** Groups and summarizes application activity.

## 7. Project Folder Structure

```text
smart-lost-and-found/
│
├── app/
│   ├── admin/
│   ├── api/
│   ├── items/
│   ├── matches/
│   ├── login/
│   ├── register/
│   ├── report-lost/
│   ├── report-found/
│   ├── notifications/
│   └── saved-searches/
│
├── components/
│
├── lib/
│   ├── auth.js
│   ├── db.js
│   ├── mongo.js
│   └── matching.js
│
├── database/
│   ├── DDL_schema.sql
│   ├── advanced_features.sql
│   ├── collection_status_migration.sql
│   ├── sample_queries.sql
│   ├── seed_locations.sql
│   └── under_review_status_migration.sql
│
├── public/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 8. Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- MongoDB Community Server
- MongoDB Compass (recommended)
- Git

## 9. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/smart-lost-and-found.git
cd smart-lost-and-found
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env.local` file in the project root using `.env.example` as a reference.

Example configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=smart_lost_found
DB_PORT=3306

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=smart_lost_found_logs

SESSION_SECRET=YOUR_LONG_RANDOM_SECRET
```

Replace the placeholder values with your own local configuration.

**Never commit `.env.local` or real database credentials to GitHub.**

### Step 4: Start database services

Ensure that MySQL Server and MongoDB Server are running.

### Step 5: Set up MySQL

Open MySQL Workbench and execute the database scripts in the appropriate order:

1. `database/DDL_schema.sql` — create the database and relational tables.
2. `database/seed_locations.sql` — populate campus locations.
3. `database/advanced_features.sql` — create advanced database objects such as indexes, views, triggers and stored procedures.

The migration scripts are intended for databases that need the corresponding schema changes. Check the existing table definitions before running them. Do not blindly rerun migrations or index-creation statements on an already configured database.

`database/sample_queries.sql` contains demonstration and testing queries. Execute individual queries when required.

### Step 6: Start the application

```bash
npm run dev
```

Open the application at:

http://localhost:3000

## 10. Authentication and Roles

The application supports two roles:

- **STUDENT:** Can register, log in, report lost/found items, view matches and submit claims.
- **ADMIN:** Can review claims, review reports, manage item collection and access administrative functionality.

Passwords are hashed before being stored. Session information and role checks are handled by the authentication module.

## 11. Important Application Workflows

### Lost and Found Reporting
Students submit lost and found item details through forms. The backend validates the request and stores the records in MySQL.

### Automatic Matching
When a found item is submitted, the application searches eligible lost-item records, calculates similarity scores and stores qualifying matches.

### Claim Management
Students submit ownership claims. Administrators review the claims and approve or reject them.

### Collection Management
After an approved claim, the administrator records the physical handover. The found item is marked as collected and removed from active listings without deleting its historical record.

### Report Review
Students can report suspicious found listings. Administrators review the reports and can place approved reported listings under review.

### MongoDB Activity and Analytics
Application events and relevant history are recorded in MongoDB. Aggregation operations support administrative analytics.

## 12. Testing

The application can be tested for:

- Student registration and login.
- Invalid login and unauthorized access.
- Role-based access restrictions.
- Lost-item reporting.
- Found-item reporting.
- Similarity score calculation and match creation.
- Claim submission and approval/rejection.
- Report submission and admin review.
- Item collection and active-listing removal.
- Notification creation.
- MongoDB activity logging and analytics.

## 13. GitHub Collaboration

The project is maintained using Git and GitHub.
Individual contributions are documented through Git commits, pull requests and the final project report.

## 14. Team Contributions

| Team member | SRN | Application contributions |
|---|---|---|---|
| Vishnu Narayanan Ajay | PES2UG24CS594 |  |
| Vishnu S.R| PES2UG24CS595 |  | 

## 15. Future Enhancements

Possible future enhancements include:
- MySQL FULLTEXT search for improved text-based candidate retrieval.
- Semantic search using vector embeddings.
- Improved image-based item matching.
- More advanced notification and search-filtering features.

## 16. Project Information

**Project:** Smart Lost and Found System  
**Course:** Database Management Systems — Level 3 Project  

**Repository:** https://github.com/YOUR-USERNAME/smart-lost-and-found

