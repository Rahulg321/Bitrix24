# Next.js Deal Sourcing Application

This is a Next.js application for deal sourcing and management. Follow the instructions below to get started.

## Prerequisites

- [Docker](https://www.docker.com/get-started/) must be installed on your system
- Node.js and npm

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd bitrix-deal-sourcing
```

2. Set up environment variables:

```bash
cp .env.example .env
```

To configure Google authentication, set the following environment variables in your `.env` file:

| Variable Name          | Description                                                                                                                       | Required | Default Value |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| `GOOGLE_CLIENT_ID`     | Your Google application's Client ID. Obtain this from the [Google Developer Console](https://console.developers.google.com/).     | Yes      | None          |
| `GOOGLE_CLIENT_SECRET` | Your Google application's Client Secret. Obtain this from the [Google Developer Console](https://console.developers.google.com/). | Yes      | None          |
| `GOOGLE_AI_API_KEY`       | Your Google Generative Language API key. Obtain this from the Google Cloud Console as described below.                            | Yes      | None          |


**Instructions:**

1a. **Obtain Google OAuth Credentials:**

   - Navigate to the [Google Developer Console](https://console.developers.google.com/).
   - Create a new project or select an existing one.
   - Go to the "Credentials" section and create OAuth 2.0 credentials.
   - Note down the generated `Client ID` and `Client Secret`.

1b. Obtain Google Generative Language API Key

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Select your project or create a new one.
- **Enable billing** on your project (required to use the API).
- Enable the **Generative Language API**:
  - Visit [Generative Language API library](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).
  - Click **Enable**.
- Go to the **Credentials** page.
- Click **Create Credentials** → **API Key**.
- Copy the generated API key.

2. **Set Up Your `.env` File:**
   - Create a `.env` file in the root directory of your project if it doesn't exist.

- `DATABASE_URL`: PostgreSQL connection string
- `AI_API_KEY`: Your OpenAI API key (not required)
  - Add the following lines, replacing the placeholder values with your actual credentials:
    ```env
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_AI_API_KEY=your-google-generative-language-api-key
    ```
  - Save the `.env` file. Ensure this file is **not** committed to version control by adding `.env` to your `.gitignore` file.

**Note:** For security reasons, never share your actual `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` publicly or commit them to version control. Use the `.env` file to manage these sensitive credentials securely.

1. Start the PostgreSQL database using Docker:

```bash
docker compose up
```

This will start the PostgreSQL database container on port 5432.

4. Install dependencies:

```bash
npm install
```

5. Initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Push the database schema
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

Note: Make sure your `package.json` includes the seed script configuration:

Create a seed file at `prisma/seed.ts` to define your initial data:

6. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Development Commands

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Database Management

- `npx prisma studio` - Open Prisma Studio to manage database records
- `npx prisma generate` - Generate Prisma Client after schema changes
- `npx prisma migrate dev` - Create and apply new migrations

## Project Structure

- `/app` - Next.js application routes and components
- `/prisma` - Database schema and migrations
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations

## Technologies Used

- Next.js 15.0
- PostgreSQL (via Docker)
- Prisma ORM
- Firebase Authentication
- OpenAI Integration
- Tailwind CSS with shadcn/ui components

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Add your license information here]
