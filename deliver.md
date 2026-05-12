# Excercise

The Project: Bookmark Manager API
You will build a REST API for managing bookmarks. Think of it as a simplified version of Pocket or Raindrop: users can save URLs, tag them, and retrieve them later with filtering.

Core features:

Add a bookmark (URL, title, optional description, tags)
List all bookmarks with optional filtering by tag
Get a single bookmark by ID
Update a bookmark
Delete a bookmark
Production requirements:

Input validation on all endpoints (reject malformed URLs, empty titles)
Proper error handling with appropriate HTTP status codes
At least one test file covering the happy path and one edge case for each endpoint
Environment-based configuration (no hardcoded values for port, database path, etc.)
A health check endpoint at GET /health
Tech stack: Node.js with Express and TypeScript. Use an in-memory array or a SQLite file for storage. Do not use a full database server; the point of this exercise is the workflow, not database setup.


# Deliver

1. Your planning notes. The task list, definition of done for each chunk, and your three production standards.

2. Build evidence (single text file). You do not need to upload the full project. Instead, submit a single text file containing:

    - Git log output. Run git log --stat --oneline from your project root and paste the full output. This should show incremental commits that match your task list, not one giant commit at the end.
    - Test results. Run npm test (or equivalent) and paste the output. All tests should pass.

3. A short reflection (3-5 sentences). At what point during the exercise did the Build-Verify-Commit cycle help you catch a problem early, or where were you most tempted to skip verification?