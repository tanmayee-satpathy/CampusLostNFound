# 🎒 Campus Lost & Found Web Application

A full-stack web application designed to help students report, find, and recover lost items on campus through a centralized, secure, and easy-to-use platform.

---

## 📌 Problem Statement

On large college campuses, students frequently lose personal belongings such as ID cards, wallets, phones, books, and accessories.  
Current solutions like WhatsApp groups or notice boards are unorganized, unreliable, and inefficient.

There is a need for a **centralized digital system** that helps students quickly report and recover lost items.

---

## 💡 Solution

**Campus Lost & Found** provides a centralized platform where:
- Users can post lost or found items
- Others can browse recent reports
- Owners and finders can reconnect efficiently
- All data is securely stored and accessible online

---

## ✨ Features

- 🔍 Browse recent lost & found items  
- 📝 Post lost or found items  
- 🖼 Upload images for better identification  
- 🔐 User authentication using Passport.js  
- 🔔 Notification system  
- 📦 MongoDB database integration  
- ☁️ Fully deployed frontend and backend  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- Passport.js
- Multer (image upload)
- CORS

### Database
- MongoDB Atlas

### Deployment
- Frontend: Netlify  
- Backend: Render  
- Database: MongoDB Atlas  

---

## 🏗 Architecture

Frontend (Netlify) ➝ Backend API (Render) ➝ MongoDB Atlas

- **Frontend:** React + Vite hosted on Netlify  
- **Backend:** Node.js + Express REST API hosted on Render  
- **Database:** MongoDB Atlas (Cloud NoSQL Database)

The frontend communicates with the backend via REST APIs, and the backend handles authentication, data validation, and database operations.

---

## 📁 Project Structure

```
CampusLostNFound/
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── screens/
│ │ ├── styles/
│ │ ├── config/
│ │ └── main.jsx
│ ├── index.html
│ └── vite.config.js
│
├── backend/
│ ├── routes/
│ ├── models/
│ ├── config/
│ ├── uploads/
│ └── server.js
│
├── README.md
└── package.json

```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|------|--------|-------------|
| GET | `/api/items` | Fetch all items |
| POST | `/api/items` | Post a new item |
| GET | `/api/users` | User details |
| POST | `/api/auth/login` | User login |
| GET | `/api/notifications` | Fetch notifications |

---

## 🔐 Authentication

- Implemented using **Passport.js**
- Ensures secure access to protected routes
- Prevents unauthorized access and data misuse

---

## 🖼️ Image Uploads

- Implemented using **Multer**
- Images are served from `/uploads`
- Each item can have an associated image for easy identification

---

## 🌍 Environment Variables

### Backend (`.env`)
PORT=4000
MONGODB_URI=your_mongodb_connection_string


### Frontend (`.env`)
VITE_API_BASE_URL=https://campus-lostnfound.onrender.com


---

## 🔄 CORS Configuration

To allow frontend-backend communication across different domains, CORS is configured in the backend.

```js
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campuslostnfound.netlify.app"
    ],
    credentials: true,
  })
);

```

---

## 🚀 Live Deployment

- **Frontend (Netlify):**  
  https://campuslostnfound.netlify.app

- **Backend (Render):**  
  https://campus-lostnfound.onrender.com

---

## 🧪 Run Locally

Follow these steps to run the project on your local machine:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/tanmayee-satpathy/CampusLostNFound.git
cd CampusLostNFound
```
### 2️⃣ Start Backend
```
cd backend
npm install
npm start
```
### 3️⃣ Start Frontend
```
cd frontend
npm install
npm run dev
```

---

## 🧠 Learnings

- Full-stack application development  
- REST API design and integration  
- MongoDB schema modeling with Mongoose  
- Cloud deployment using **Netlify** (Frontend) and **Render** (Backend)  
- Handling **CORS** and browser security policies  
- Debugging real-world production and deployment issues  

---

## 🔮 Future Enhancements

- Email or push notification system  
- Admin dashboard for moderation  
- Advanced search and filtering options  
- Item claim and verification workflow  
- Campus-based access control and authentication  

---

## 👩‍💻 Author

**Tanmayee Satpathy**  
B.Tech Computer Science & Engineering (2027)  
Kalinga Institute of Industrial Technology (KIIT)  

