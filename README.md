# JobTrack - Student Placement & Application Tracker

A full-stack web application designed for students and job seekers to track job applications, schedule interview rounds, visualize application metrics, and manage career placements.

---

## 🌟 Key Features

### 1. User Authentication & Profile

- **Registration & Login**: Secure JWT-based authentication with password hashing using `bcryptjs`.
- **Student Profile**: Stores student details including college/university, degree, and graduation year.

### 2. Full Application Lifecycle Management (CRUD)

- **Track Job Applications**: Record company name, job title, location, salary, job type (Full Time, Internship, Part Time), work mode (On-site, Hybrid, Remote), status, job link, and notes.
- **Application Statuses**: Track stages: _Wishlist_, _Applied_, _Online Assessment_, _Interview_, _Offer_, _Rejected_, _Withdrawn_.
- **Search, Filter & Sort**: Search by company or role; filter by status or work mode; sort by newest, oldest, or company name.

### 3. Interview Schedule & Agenda

- **Nested Interview Rounds**: Log multiple interview rounds (Technical, HR, Managerial, Online Assessment) for each job application.
- **Result Tracking**: Track interview round results (_Pending_, _Passed_, _Failed_) and review notes.
- **Interview Calendar Agenda**: Consolidated view of upcoming and past interview rounds.

### 4. Visual Analytics & Insights

- **Interactive Charts**: Responsive status distribution pie chart and recruitment pipeline funnel bar chart powered by `Recharts`.
- **Metric Cards**: Real-time conversion metrics including interview rates, offer success rates, and active pipeline volume.

### 5. Data Backup, Export & Import

- **CSV & JSON Export**: Export saved application history for offline record-keeping.
- **JSON Import**: Restore or bulk-import application datasets into MongoDB.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas + Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 📁 Project Structure

```text
├── server.js                   # Express server entry point & middleware configuration
├── server/
│   ├── config/
│   │   └── db.js               # MongoDB connection setup
│   ├── controllers/
│   │   ├── applicationController.js # CRUD & interview handlers for applications
│   │   └── authController.js   # Student registration, login, and profile handlers
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication verification middleware
│   ├── models/
│   │   ├── Application.js      # Mongoose schema for job applications & interviews
│   │   └── User.js             # Mongoose schema for student users
│   └── routes/
│       ├── applicationRoutes.js# Express routes for application CRUD & interviews
│       └── authRoutes.js       # Express routes for register & login
├── src/
│   ├── components/
│   │   ├── AnalyticsView.tsx   # Recharts visualization UI tab
│   │   ├── DataBackupModal.tsx # Export/Import CSV & JSON modal
│   │   ├── InterviewCalendarView.tsx # Interview agenda timeline tab
│   │   └── ProtectedRoute.jsx  # Auth guard component
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication state provider
│   ├── pages/
│   │   ├── Login.jsx           # Student login screen
│   │   └── Register.jsx        # Student registration screen
│   ├── App.tsx                 # Main application shell and table view
│   └── main.tsx                # React entry point
└── package.json
```

---

## 🔌 API Endpoints Summary

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new student account
- `POST /api/auth/login` - Authenticate student and return JWT token
- `GET /api/auth/profile` - Get authenticated student profile details

### Application Routes (`/api/applications`)

- `GET /api/applications` - Get all job applications for the logged-in user
- `POST /api/applications` - Create a new job application
- `PUT /api/applications/:id` - Update an existing application
- `DELETE /api/applications/:id` - Delete an application
- `GET /api/applications/stats` - Retrieve application count metrics
- `POST /api/applications/:id/interviews` - Add an interview round to an application
- `DELETE /api/applications/:id/interviews/:interviewId` - Remove an interview round

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobtrack
JWT_SECRET=your_jwt_secret_key_here
```

---

## 🚀 Running the Project Locally

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm run start
   ```

---

## 🎓 College Project Highlights

- **Clean Architecture**: Clear separation of concerns between client UI, Express backend controllers, Mongoose schemas, and authentication middleware.
- **Security Best Practices**: Passwords hashed with `bcryptjs` and route authorization via `JWT`.
- **Production-Ready UI**: Responsive layout using Tailwind CSS with interactive charts, status filters, search controls, and accessibility considerations.
