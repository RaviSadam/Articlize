# Blogging Portal

Welcome to the Blogging Portal project! This application allows users to register, login, and manage articles. Users can create new articles which other users can pick up, write, and submit for review. The system includes features for caching, scheduling, and database management to optimize performance and user experience.

## Tech Stack

- **Node.js**: Backend runtime environment
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database for storing article metadata and compressed article bodies
- **Redis**: Key-value store for caching and managing counters
- **EJS**: Templating engine for rendering HTML templates
- **HTML, CSS, JavaScript, TypeScript**: Frontend technologies for user interface and interactivity

## Modules Used

- **Express**: Web framework for Node.js
- **Mongoose**: MongoDB object modeling for Node.js
- **Redis**: Node.js client for Redis
- **Scheduler**: Module for scheduling tasks and background jobs

## Features

- User Authentication:
  - User registration, login, and logout functionalities.

- Article Management:
  - Users can create new article titles.
  - Other users can pick articles to write and submit them for review.

- Review Process:
  - Reviewers can approve articles submitted for review.
  - Approved articles are stored in MongoDB.

- Space Optimization:
  - Article bodies are compressed for space optimization.
  - Redis is used for caching and managing counters.

- Save Option:
  - Articles are temporarily stored in Redis when saved.
  - Saved articles are eventually persisted in MongoDB.

- Editor:
  - Uses Quill text editor for writing articles.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Articlize.git
   cd Articlize
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on the provided `.env.example` and configure it with your MongoDB and Redis connection details.

4. Start the application:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:8080` to access the application.
