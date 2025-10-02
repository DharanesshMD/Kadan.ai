# Kadan.ai

## Project Description
This is a Next.js application that leverages the Gemma API for AI functionalities. It includes components for user input, displaying results, and API routes for calculations and Gemini interactions.

## Technologies Used
- Next.js
- React
- TypeScript
- Tailwind CSS
- Gemma API (https://build.nvidia.com/google/gemma-3-27b-it)

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or Yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd Kadan.ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root of your project and add your NVIDIA API key:
    ```
    NVIDIA_API_KEY=your_nvidia_api_key
    ```
    Replace `your_nvidia_api_key` with your actual API keys.

### Running the Development Server

To run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

-   `app/`: Contains the main application pages and API routes.
    -   `api/`: API routes for backend functionalities.
        -   `calculate/`: API endpoint for calculations.
    -   `input/`: Page for user input.
    -   `results/`: Page for displaying results.
    -   `layout.tsx`: Root layout for the application.
    -   `page.tsx`: Home page.
-   `components/`: Reusable UI components.
    -   `ui/`: UI components like `input.tsx` and `select.tsx`.
-   `context/`: React context for global state management.
    -   `AppContext.tsx`: Application context.
-   `lib/`: Utility functions and API integrations.
    -   `prompts.ts`: AI prompt definitions.
    -   `utils.ts`: General utility functions.
-   `public/`: Static assets.
-   `styles/`: Global styles.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Runs the built application in production mode.
-   `npm run lint`: Lints the project.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!