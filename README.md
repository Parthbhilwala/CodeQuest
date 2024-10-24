CodeQuest Search Application
A full-stack application that searches Reddit and Stack Overflow and allows users to email the results.
Table of Contents

Prerequisites
Project Structure
Backend Setup
Frontend Setup
Environment Variables
Running the Application
API Endpoints
Common Issues

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14.0.0 or higher)
npm (v6.0.0 or higher)
Git

Project Structure
Copycodequest-search/
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
Backend Setup

Create and navigate to the backend directory:

bashCopymkdir backend
cd backend

Initialize a new Node.js project:

bashCopynpm init -y

Install required dependencies:

bashCopynpm install express cors dotenv nodemailer mailgen axios body-parser

Install development dependencies:

bashCopynpm install nodemon --save-dev

Update package.json with scripts:

jsonCopy{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}

Create .env file in the backend directory:

envCopyPORT=5000
EMAIL=your.gmail@gmail.com
APP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
Frontend Setup

Create a new React application:

bashCopynpx create-react-app frontend
cd frontend

Install required dependencies:

bashCopynpm install axios react-toastify @tailwindcss/forms tailwindcss postcss autoprefixer

Initialize Tailwind CSS:

bashCopynpx tailwindcss init -p

Update package.json with proxy:

jsonCopy{
  "proxy": "http://localhost:5000"
}
Environment Variables
Backend (.env)
envCopyPORT=5000
EMAIL=your.gmail@gmail.com
APP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
Frontend (.env)
envCopyREACT_APP_API_URL=http://localhost:5000/api
Running the Application
Backend

Navigate to the backend directory:

bashCopycd backend

Install dependencies:

bashCopynpm install

Start the development server:

bashCopynpm run dev
The backend server will start on port 5000 (or the port specified in your .env file).
Frontend

Navigate to the frontend directory:

bashCopycd frontend

Install dependencies:

bashCopynpm install

Start the development server:

bashCopynpm start
The frontend application will start on port 3000 and open in your default browser.
API Endpoints
Search
CopyGET /api/search?query={searchTerm}
Send Email
CopyPOST /api/send-email
Content-Type: application/json

{
  "email": "user@example.com",
  "results": {
    "reddit": [...],
    "stackOverflow": [...]
  },
  "query": "search term"
}
Gmail Setup for SMTP

Enable 2-Step Verification in your Google Account:

Go to Google Account settings
Security
"2-Step Verification"
Follow the steps to enable


Generate App Password:

Go to Google Account settings
Security
"2-Step Verification"
"App passwords" (at the bottom)
Select app: "Mail"
Select device: "Other (Custom name)"
Enter "CodeQuest Search"
Copy the generated password
Use this password in your .env file



Common Issues

Email sending fails

Verify your Gmail app password is correct
Ensure 2-Step Verification is enabled
Check if your Gmail account has less secure app access disabled


CORS errors

Verify the proxy setting in frontend package.json
Check if the backend CORS configuration is correct
Ensure the API URL in the frontend matches the backend port


Build errors

Clear npm cache: npm cache clean --force
Delete node_modules and reinstall:
bashCopyrm -rf node_modules
npm install



Port already in use

Kill the process using the port:
bashCopy# For Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# For Mac/Linux
lsof -i :5000
kill -9 <PID>




Additional Configuration Files
Backend server.js
javascriptCopyconst express = require('express');
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
Backend routes/api.js
javascriptCopyconst express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/search', searchController.search);
router.post('/send-email', searchController.sendEmail);

module.exports = router;
