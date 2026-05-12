# Bookmarks

## Stack

- Express
- Typescript
- SQLite database

## Task List

1. Boilerplate (TS + Express + scripts + env config)
2. Folder structure (routes/controllers/services/models + test layout)
3. Health endpoint (GET /health)
4. Bookmark model + storage layer (SQLite wrapper)
5. Error handling + response format conventions (central middleware)
6. Endpoints one-by-one (GET list, GET by id, POST, PUT, DELETE) — each includes:
    - validation
    - correct status codes
    - tests for happy + edge



## Chunks for GET, GET by ID, POST, PUT, DELETE


### Before Start

Make sure all deps for express and typescript are installed, and additionaly the next following deps:

- SQLite driver (sqlite3 or better-sqlite3—pick one)
- UUID generation (uuid)
- Validation (Zod or similar)
- Endpoint tests (supertest + Vitest)
- dotenv
- @types/express, @types/node, @types/supertest

### Chunk 1 - codebase

- Boilerplater for express and typescript
- Folder structure for bookmarks api (models, services, controllers)
- `npx tsc --noEmit` should pass with no errors
- `npx ts-node src/index.ts` should start the server with no errors
- test runner wired and `npm test` runs

### Chunk 1.05 - Health endpoint + test

- Create the health endpoint
- 200 OK = body: { status: 'ok' }
- Add unit test: GET /health returns 200 and { status: 'ok' }

### Chunk 1.15 - Error handling + response conventions

- Add central error middleware and consistent error response shape
- Add minimal tests asserting 400/404 error body shape on one route

## Chunk 1.1 - data model

- SQLite initialization
- Create Bookmark data schema
- Migration strategy: on startup run CREATE TABLE IF NOT EXISTS (no external migration tool)
- Tags storage: store tags as JSON text column (JSON.stringify/parse)


## Chunk 1.2 - Bookmark schema

- Bookmark schema: `URL, title, optional description, tags`
    * ID: uuid
    * URL: string
    * title: string
    * description: string?
    * tags: string[] (allow empty array)
- Create bookmark interface + validation-schema



### Chunk 2 - GET endpoint (list all bookmarks)

- List all bookmarks 
- GET endpoint should accept optional tag list to filter
- Query param to filter by tags example: `?tags=a,b`  (trim/lowercase/dedupe)
- Filtering semantics: match ANY tag (OR) from the list (document + test)
- Unit test should cover happy path to list bookmarks


### Chunk 3 - GET by ID (find bookmark by id)

- Find a bookmark by id 
- GET endpoint should accept mandatory id on path param
- 200 OK should return a bookmark
- 404 NOT FOUND should be return when bookmark does not exists on database
- 400 for invalid/malformed id param.
- Unit test should cover happy path and edge cases

### Chunk 4 - POST

- Create a bookmark
- POST to create a bookmark
- Description is optional
- reject malformed url
- reject empty title
- tags is optional; if omitted, store [] ; if provided, must be string[] (then trim/lowercase/dedupe)
- 201 when success
- 400 for invalid payload
- Unit test should cover happy path and edge cases


### Chunk 5 (PUT + tests)

- Update bookmark
- Can update full bookmark (except id)
- PUT : `/{id}` => `body: { title: '', description: '', tags: [] }`
- 200 OK
- 404 not found
- 400 bad request

### Chunk 6 (DELETE + tests)

- Delete a bookmark
- DELETE : `/{id}`
- 404 not found
- 204 No Content