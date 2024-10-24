# CodeQuest Search Application

A full-stack application that searches Reddit and Stack Overflow and allows users to email the results.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Common Issues](#common-issues)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## Project Structure

```
codequest-search/
├── backend/
│   ├── controllers/
│   │   └── searchController.js
│   ├── routes/
│   │   └── api.js
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Backend Setup

1. Create and navigate to the backend directory:
```bash
mkdir backend
cd backend
```

2. Initialize a new Node.js project:
```bash
npm init -y
```

3. Install required dependencies:
```bash
npm install express cors dotenv nodemailer mailgen axios body-parser
```

4. Install development dependencies:
```bash
npm install nodemon --save-dev
```

5. Update `package.json` with scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

6. Create `.env` file in the backend directory:
```env
PORT=5000
EMAIL=your.gmail@gmail.com
APP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

## Frontend Setup

1. Create a new React application:
```bash
npx create-react-app frontend
cd frontend
```

2. Install required dependencies:
```bash
npm install axios react-toastify @tailwindcss/forms tailwindcss postcss autoprefixer
```

3. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

4. Update `package.json` with proxy:
```json
{
  "proxy": "http://localhost:5000"
}
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
EMAIL=your.gmail@gmail.com
APP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Backend
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend server will start on port 5000 (or the port specified in your .env file).

### Frontend
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend application will start on port 3000 and open in your default browser.

## API Endpoints

### Search
```
GET /api/search?query={searchTerm}
```

### Send Email
```
POST /api/send-email
Content-Type: application/json

{
  "email": "user@example.com",
  "results": {
    "reddit": [...],
    "stackOverflow": [...]
  },
  "query": "search term"
}
```

## Gmail Setup for SMTP

1. Enable 2-Step Verification in your Google Account:
   - Go to Google Account settings
   - Security
   - "2-Step Verification"
   - Follow the steps to enable

2. Generate App Password:
   - Go to Google Account settings
   - Security
   - "2-Step Verification"
   - "App passwords" (at the bottom)
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter "CodeQuest Search"
   - Copy the generated password
   - Use this password in your .env file

## Common Issues

1. **Email sending fails**
   - Verify your Gmail app password is correct
   - Ensure 2-Step Verification is enabled
   - Check if your Gmail account has less secure app access disabled

2. **CORS errors**
   - Verify the proxy setting in frontend package.json
   - Check if the backend CORS configuration is correct
   - Ensure the API URL in the frontend matches the backend port

3. **Build errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: 
     ```bash
     rm -rf node_modules
     npm install
     ```

4. **Port already in use**
   - Kill the process using the port:
     ```bash
     # For Windows
     netstat -ano | findstr :5000
     taskkill /PID <PID> /F

     # For Mac/Linux
     lsof -i :5000
     kill -9 <PID>
     ```

## Additional Configuration Files

### Backend server.js
```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Backend routes/api.js
```javascript
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/search', searchController.search);
router.post('/send-email', searchController.sendEmail);

module.exports = router;
```


