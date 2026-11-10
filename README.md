# Smart Lost and Found System

A web-based Smart Lost and Found application developed as a **DBMS Level 3 project**. The system helps students report lost and found belongings, discover possible matches, submit ownership claims and receive notifications. Administrators can review claims, investigate reported listings and manage item collection.

---

## 1. Project Overview

The Smart Lost and Found System addresses the difficulty of recovering misplaced belongings in a campus environment.

### Student Features
- Register and log in securely.
- Report lost items.
- Report found items.
- View possible lost-and-found matches.
- Submit ownership claims with proof descriptions.
- Receive notifications about claim decisions.
- Save searches and receive relevant alerts.
- View item activity history.

### Administrator Features
- Access the administrative dashboard.
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

The application follows a three-layer architecture:

1. **Presentation Layer:** Next.js pages and React components display information and collect user input.
2. **Application Layer:** Next.js API routes handle validation, authentication, matching and application operations.
3. **Data Layer:** MySQL stores structured relational data, while MongoDB stores flexible activity and history documents.

Some Next.js server components also retrieve data directly from MySQL using the database connection module.

The frontend communicates with backend API routes through HTTP requests and JSON responses. Database credentials and SQL operations remain on the server side.

## 4. Database Design

The project uses MySQL and MongoDB to demonstrate relational and NoSQL database concepts.

### 4.1 MySQL Database

**Database name:** `smart_lost_found`

The relational database contains the following main tables:

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

Database integrity is maintained using primary keys, foreign keys, unique constraints, NOT NULL constraints, defaults and CHECK constraints.

### 4.2 MongoDB Database

**Database name:** `smart_lost_found_logs`

MongoDB is used for flexible application records and activity tracking.

Collections include:

- `activity_logs` – Records application activities.
- `item_history` – Maintains item-related history.
- `admin_audit_logs` – Stores administrative activity.
- `saved_searches` – Stores student search preferences.
- `saved_search_alerts` – Stores relevant saved-search alerts.

MongoDB aggregation operations are used to summarize application activity and support administrative analytics.

## 5. Matching System

The application uses a weighted rule-based matching algorithm implemented in `lib/matching.js`.

The algorithm considers the following attributes:

| Attribute | Weight |
|---|---:|
| Item name | 40% |
| Category | 20% |
| Colour | 15% |
| Brand | 15% |
| Description | 10% |
| **Total** | **100%** |

The matching API evaluates candidate lost-item records and creates a match when the configured matching rules and score threshold are satisfied.

The resulting similarity score is stored in the MySQL `matches` table.

## 6. Advanced Database Concepts

The project demonstrates the following DBMS concepts:

1. **DDL and Integrity Constraints:** Table definitions, primary keys, foreign keys, unique constraints and CHECK constraints.
2. **DML and CRUD Operations:** INSERT, SELECT, UPDATE and DELETE operations.
3. **JOIN Queries:** Retrieve related information from multiple relational tables.
4. **Nested and Correlated Subqueries:** Filter records based on related matches and claims.
5. **Transactions:** Group related database changes and use COMMIT and ROLLBACK handling.
6. **Triggers:** Automatically create notifications after matching events.
7. **Stored Procedures:** The `ProcessClaim` procedure handles claim status updates.
8. **Views:** `vw_match_details` combines match and user information.
9. **Indexes:** Improve the performance of relevant database searches.
10. **MongoDB Aggregation:** Groups and summarizes application activity.

## 7. Project Folder Structure

```text
Smart_Lost_and_Found/
│
├── app/
│   ├── admin/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── claim/
│   │   │   ├── collection/
│   │   │   └── report/
│   │   ├── auth/
│   │   ├── claims/
│   │   ├── found/
│   │   ├── locations/
│   │   ├── lost/
│   │   ├── reports/
│   │   └── saved-searches/
│   │
│   ├── item-history/
│   ├── items/
│   ├── login/
│   ├── matches/
│   ├── notifications/
│   ├── register/
│   ├── report-found/
│   ├── report-lost/
│   └── saved-searches/
│
├── components/
│   ├── AdminClaimActions.js
│   ├── AdminCollectionAction.js
│   ├── AdminReportActions.js
│   ├── MongoAnalytics.js
│   ├── SavedSearchManager.js
│   └── ...
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

Install the following software before running the project:

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- MongoDB Community Server
- MongoDB Compass (recommended)
- Git

## 9. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/vishnu201917-n/Smart_Lost_and_Found.git
cd Smart_Lost_and_Found
```

### Step 2: Install Dependencies

```bash
npm install
```

On Windows PowerShell, if the npm script execution policy causes an error, use:

```powershell
npm.cmd install
```

### Step 3: Configure Environment Variables

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

**Important:** Never commit `.env.local` or real database credentials to GitHub.

### Step 4: Start Database Services

Ensure that MySQL Server and MongoDB Server are running.

### Step 5: Set Up MySQL

Open MySQL Workbench and execute the database scripts in the appropriate order:

1. `database/DDL_schema.sql` – Creates the database and relational tables.
2. `database/seed_locations.sql` – Populates campus locations.
3. `database/advanced_features.sql` – Creates advanced database objects such as indexes, views, triggers and stored procedures.

The migration scripts are intended for databases that require the corresponding schema changes. Check existing table definitions before running them. Do not blindly rerun migrations or index-creation statements on an already configured database.

`database/sample_queries.sql` contains demonstration and testing queries. Execute individual queries when required.

### Step 6: Start the Application

```bash
npm run dev
```

On Windows PowerShell, use:

```powershell
npm.cmd run dev
```

Open the application in your browser:

http://localhost:3000

## 10. Authentication and User Roles

The application supports two roles:

### STUDENT
- Register and log in.
- Report lost and found items.
- View possible matches.
- Submit ownership claims.
- Report suspicious listings.
- Save searches.
- View notifications and item history.

### ADMIN
- Access the administrative dashboard.
- Review and process student claims.
- Approve or reject claims.
- Review suspicious-item reports.
- Manage item collection.
- View activity analytics.

Passwords are hashed before storage. Session information and role checks are handled by the authentication module.

## 11. Important Application Workflows

### 11.1 Lost and Found Reporting

Students submit lost and found item details through forms. The backend validates the request and stores the records in MySQL.

### 11.2 Automatic Matching

When a found item is submitted, the application searches eligible lost-item records, calculates similarity scores and stores qualifying matches.

### 11.3 Claim Management

Students submit ownership claims with proof descriptions. Administrators review the claims and approve or reject them.

The `ProcessClaim` stored procedure is used for claim processing.

### 11.4 Collection Management

After a claim is approved, the administrator records the physical handover. The found item is marked as collected and removed from active listings without deleting its historical record.

### 11.5 Suspicious Listing Review

Students can report suspicious found-item listings. Administrators review submitted reports and can place reported listings under review.

### 11.6 Saved Searches and Alerts

Students can save search preferences. The application uses MongoDB to store saved searches and relevant alerts.

### 11.7 Notifications and Item History

The application provides a notifications page and an item-history page. MongoDB maintains relevant activity and historical records.

### 11.8 Administrative Analytics

The admin dashboard retrieves activity analytics from MongoDB aggregation operations.

## 12. Testing and Verification

The following testing areas are relevant to the project:

- Student registration and login.
- Invalid login and unauthorized access.
- Role-based access restrictions.
- Lost-item reporting.
- Found-item reporting.
- Similarity score calculation and match creation.
- Claim submission and approval/rejection.
- Suspicious report submission and administrator review.
- Item collection and active-listing removal.
- Notification creation.
- MongoDB activity logging.
- Saved-search functionality and alerts.
- MongoDB activity analytics.

### Build Verification

The application was tested using the Next.js production build command:

```bash
npm run build
```

**Recorded build result:**
- Production compilation completed successfully.
- Linting and type checks passed.
- Page data collection completed.
- Static page generation completed: 28/28.
- Build traces were collected.
- Production optimization completed.

The build output included the admin dashboard, admin APIs, claims API, reports API, saved-search API, notifications page and item-history page.

Note: A successful production build verifies compilation and route generation. Live database connectivity and application workflows should be tested separately.

## 13. GitHub Collaboration

The project is maintained using Git and GitHub.

We used separate feature branches and pull requests to collaborate.

### Main Collaboration Branches

- `main` – Main integrated project branch.
- `feature/student-matching` – Student module, database schema and matching implementation.
- `feature/admin-mongodb` – Admin dashboard, claim/report workflows and MongoDB-related features.

Both feature branches were integrated into `main through merged pull requests.

Individual contributions are documented through Git commits, pull requests and the final project report.

## 14. Team Contributions

| Team Member | SRN | Contributions |
|---|---|---|
| Vishnu Narayanan Ajay | PES2UG24CS594 | Student module, authentication, MySQL schema, lost/found reporting, matching system, database scripts and shared database integration. |
| Vishnu S.R | PES2UG24CS595 | Admin dashboard, admin management APIs, claim and report workflows, collection management, saved searches, notifications, item history and MongoDB analytics integration. |

Both team members contributed to the development and integration of the application and database components.

## 15. Future Enhancements

Possible future enhancements include:

- MySQL FULLTEXT search for improved text-based candidate retrieval.
- Semantic search using vector embeddings.
- Improved image-based item matching.
- More advanced notification and search-filtering features.
- Improved analytics and reporting capabilities.

## 16. Project Information

**Project:** Smart Lost and Found System  
**Course:** Database Management Systems – Level 3 Project  
**Frontend:** Next.js and React  
**Backend:** Next.js API Routes  
**Databases:** MySQL and MongoDB  
**Programming Language:** JavaScript  
**Version Control:** Git and GitHub
