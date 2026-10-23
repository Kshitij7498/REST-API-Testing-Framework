# REST API Testing Framework

A complete, locally runnable API testing project built with **JavaScript, Postman Collection, Newman, Express, JSON validation, and GitHub Actions**. It includes a sample CRUD API so the test suite works without an external service or API key.

## What is covered

- Successful GET, POST, PUT, and DELETE requests
- CRUD workflow and response-body/data checks
- HTTP status-code assertions
- Missing/invalid input and malformed JSON handling
- Authentication failures (missing and invalid Bearer token)
- JSON response shape/type checks
- Not-found responses
- Automated CLI execution with Newman
- GitHub Actions CI workflow

## Requirements

- Node.js 18 or newer
- npm
- VS Code (recommended)

Check installation in the VS Code terminal:

```bash
node --version
npm --version
```

## Run in VS Code

1. Extract the ZIP.
2. Open the extracted `RestAPI-Testing-Framework` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Run the complete test suite:

   ```bash
   npm test
   ```

The runner starts the local API, waits until it responds, runs the Postman collection using Newman, and shuts down the API. A successful run exits with code `0`; a failed test exits non-zero.

## Run the API separately

Terminal 1:

```bash
npm start
```

The API listens on `http://127.0.0.1:3000`.

Terminal 2:

```bash
npm run test:collection
```

Stop the API with `Ctrl+C` when finished.

## Authentication

The sample API expects:

```http
Authorization: Bearer test-token
```

This is a demo token for local testing only. Do not use it as a production credential.

## Endpoints

| Method | Endpoint | Expected behavior |
|---|---|---|
| GET | `/health` | Public health check |
| GET | `/api/items` | List items (authenticated) |
| GET | `/api/items/:id` | Read item (authenticated) |
| POST | `/api/items` | Create item (authenticated; `name` required) |
| PUT | `/api/items/:id` | Update item (authenticated; `name` required) |
| DELETE | `/api/items/:id` | Delete item (authenticated) |

Seed item: `id=1`, `name="Sample item"`, `description="Seed record"`.

## Project structure

```text
RestAPI-Testing-Framework/
├── .github/workflows/api-tests.yml
├── postman/
│   ├── RestAPI-Testing-Framework.postman_collection.json
│   └── local.postman_environment.json
├── scripts/
│   └── run-tests.js
├── src/
│   └── server.js
├── tests/
│   └── README.md
├── .gitignore
├── package.json
└── README.md
```

## Import into Postman (optional)

1. Open Postman.
2. Select **Import**.
3. Import `postman/RestAPI-Testing-Framework.postman_collection.json`.
4. Import `postman/local.postman_environment.json`.
5. Start the API with `npm start`, select the `Local REST API` environment, and run the collection.

The collection uses a `baseUrl` environment variable and sets the created item ID dynamically during the CRUD workflow.

## GitHub Actions

The workflow installs dependencies and runs `npm test` on pushes and pull requests. Push the extracted project to a GitHub repository to enable CI.

## Notes

- This is a demonstration framework with an intentionally small local API. It is designed to show test design and automation fundamentals, not production security.
- The database is in memory and resets whenever the server restarts.
- The malformed-JSON test expects Express to return HTTP `400`.
