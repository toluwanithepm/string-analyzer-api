# String Analyzer API 🔤

A RESTful API service that analyzes strings and stores their computed properties. Built for the Backend Wizards Stage 1 Challenge.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)

## ✨ Features

For each analyzed string, the API computes and stores:
- **Length**: Number of characters
- **Is Palindrome**: Whether string reads same forwards/backwards (case-insensitive)
- **Unique Characters**: Count of distinct characters
- **Word Count**: Number of words separated by whitespace
- **SHA-256 Hash**: Unique identifier for the string
- **Character Frequency Map**: Occurrence count for each character

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Language**: JavaScript (ES6+)

## 📦 Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- A Supabase account ([sign up here](https://supabase.com))

## 🚀 Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/string-analyzer-api.git
   cd string-analyzer-api
```

2. **Install dependencies**
```bash
   npm install
```

## 🗄 Database Setup

### Setting up Supabase

1. **Create a Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details

2. **Run the database schema**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy the contents of `database/schema.sql`
   - Paste and run the SQL script
   - This will create the `strings` table with all necessary indexes

3. **Get your credentials**
   - Go to Project Settings → API
   - Copy your:
     - Project URL (SUPABASE_URL)
     - Anon/Public key (SUPABASE_ANON_KEY)

### Database Schema
```sql
CREATE TABLE strings (
    id VARCHAR(64) PRIMARY KEY,              -- SHA-256 hash
    value TEXT NOT NULL UNIQUE,              -- Original string
    length INTEGER NOT NULL,                 -- Character count
    is_palindrome BOOLEAN NOT NULL,          -- Palindrome check
    unique_characters INTEGER NOT NULL,      -- Unique char count
    word_count INTEGER NOT NULL,             -- Word count
    sha256_hash VARCHAR(64) NOT NULL,        -- Hash value
    character_frequency_map JSONB NOT NULL,  -- Char frequency
    created_at TIMESTAMPTZ DEFAULT NOW()     -- Timestamp
);
```

## 🔐 Environment Variables

1. **Create a `.env` file** in the root directory:
```bash
   cp .env.example .env
```

2. **Fill in your credentials**:
```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important**: Never commit your `.env` file to version control!

## 💻 Running Locally

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Verify it's running
Visit `http://localhost:3000/health` - you should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T10:00:00.000Z"
}
```

## 📖 API Documentation

Base URL: `http://localhost:3000` (or your deployed URL)

### 1. Create/Analyze String

**Endpoint**: `POST /strings`

**Request Body**:
```json
{
  "value": "Hello World"
}
```

**Success Response** (201 Created):
```json
{
  "id": "abc123...",
  "value": "Hello World",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "W": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-20T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing "value" field
- `409 Conflict`: String already exists
- `422 Unprocessable Entity`: Invalid data type

**Example with curl**:
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "Hello World"}'
```

---

### 2. Get Specific String

**Endpoint**: `GET /strings/{string_value}`

**Example**: `GET /strings/Hello%20World`

**Success Response** (200 OK):
```json
{
  "id": "abc123...",
  "value": "Hello World",
  "properties": { /* same as above */ },
  "created_at": "2025-10-20T10:00:00Z"
}
```

**Error Response**:
- `404 Not Found`: String doesn't exist

**Example with curl**:
```bash
curl http://localhost:3000/strings/Hello%20World
```

---

### 3. Get All Strings with Filtering

**Endpoint**: `GET /strings`

**Query Parameters**:
- `is_palindrome` (boolean): Filter palindromes
- `min_length` (integer): Minimum string length
- `max_length` (integer): Maximum string length
- `word_count` (integer): Exact word count
- `contains_character` (string): Single character to search for

**Example**: `GET /strings?is_palindrome=true&min_length=5&word_count=1`

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": { /* ... */ },
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "word_count": 1
  }
}
```

**Error Response**:
- `400 Bad Request`: Invalid query parameters

**Example with curl**:
```bash
curl "http://localhost:3000/strings?is_palindrome=true&min_length=5"
```

---

### 4. Natural Language Filtering

**Endpoint**: `GET /strings/filter-by-natural-language`

**Query Parameter**: `query` (string)

**Supported Queries**:
- "all single word palindromic strings"
- "strings longer than 10 characters"
- "palindromic strings containing the letter z"
- "strings with exactly 5 characters"
- "two word strings"

**Example**: `GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`

**Success Response** (200 OK):
```json
{
  "data": [ /* matching strings */ ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Unable to parse query
- `422 Unprocessable Entity`: Conflicting filters

**Example with curl**:
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20palindromes"
```

---

### 5. Delete String

**Endpoint**: `DELETE /strings/{string_value}`

**Example**: `DELETE /strings/Hello%20World`

**Success Response**: `204 No Content` (empty body)

**Error Response**:
- `404 Not Found`: String doesn't exist

**Example with curl**:
```bash
curl -X DELETE http://localhost:3000/strings/Hello%20World
```

---

## 🌐 Deployment

### Recommended Platforms

You can deploy to any of these platforms (NOT Vercel or Render):

1. **Railway** (Recommended)
2. **Heroku**
3. **AWS (EC2, Elastic Beanstalk)**
4. **Google Cloud Platform**
5. **Azure**
6. **Fly.io**

### Deployment Steps (Railway Example)

1. **Install Railway CLI**
```bash
   npm install -g @railway/cli
```

2. **Login to Railway**
```bash
   railway login
```

3. **Initialize project**
```bash
   railway init
```

4. **Add environment variables**
```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_ANON_KEY=your_key
   railway variables set NODE_ENV=production
```

5. **Deploy**
```bash
   railway up
```

6. **Get your URL**
```bash
   railway domain
```

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NODE_ENV=production`
- `PORT` (usually set automatically)

## 🧪 Testing

### Manual Testing with curl

**Test creating a string**:
```bash
curl -X POST https://your-api-url.com/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'
```

**Test getting all palindromes**:
```bash
curl "https://your-api-url.com/strings?is_palindrome=true"
```

**Test natural language query**:
```bash
curl "https://your-api-url.com/strings/filter-by-natural-language?query=single%20word%20palindromes"
```

### Using Postman

1. Import the collection (if provided)
2. Set the base URL variable
3. Run all tests

## 📁 Project Structure
```
string-analyzer-api/
├── src/
│   ├── config/
│   │   └── supabase.js           # Supabase client setup
│   ├── controllers/
│   │   └── stringController.js    # Request handlers
│   ├── services/
│   │   ├── stringAnalyzer.js      # String analysis logic
│   │   └── nlpParser.js           # Natural language parser
│   ├── routes/
│   │   └── stringRoutes.js        # API routes
│   ├── middleware/
│   │   ├── errorHandler.js        # Error handling
│   │   └── validator.js           # Request validation
│   └── app.js                     # Express app setup
├── database/
│   └── schema.sql                 # Database schema
├── tests/
│   └── string.test.js             # API tests
├── .env                           # Environment variables (not in git)
├── .env.example                   # Example env file
├── .gitignore
├── package.json
├── README.md
└── server.js                      # Entry point
```

## 📝 Dependencies

### Production Dependencies
- `express`: ^4.18.2 - Web framework
- `@supabase/supabase-js`: ^2.39.0 - Supabase client
- `dotenv`: ^16.3.1 - Environment variables
- `cors`: ^2.8.5 - CORS middleware
- `helmet`: ^7.1.0 - Security headers
- `morgan`: ^1.10.0 - HTTP request logger

### Development Dependencies
- `nodemon`: ^3.0.2 - Auto-reload during development
- `jest`: ^29.7.0 - Testing framework
- `supertest`: ^6.3.3 - HTTP testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Toluwani**
- Email: goldenwritertolu@gmail.com
- GitHub: [@toluwanithepm](https://github.com/toluwanithepm)

## 🙏 Acknowledgments

- Backend Wizards Stage 1 Challenge
- Supabase for database hosting
- Express.js community

---

Made with ❤️ for Backend Wizards