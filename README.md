# Real-Time Collaborative Editor

A collaborative rich-text editor built using **Next.js 14 (TypeScript & Tailwind CSS)**, **Tiptap**, **Yjs (CRDTs)**, **y-websocket**, and **PostgreSQL** (via **Prisma**).

---

## Local Development

The project is split into two components:
1. `collab-editor`: Next.js frontend app.
2. `ws-server`: Node.js WebSocket and API server.

### 1. Setup the WebSocket & Database Server (`ws-server`)
1. Navigate to the `ws-server` directory:
   ```bash
   cd ws-server
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Set your PostgreSQL connection URL (`DATABASE_URL`) and server `PORT` in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/collab_editor?schema=public"
   PORT=1234
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the database migrations to set up the `documents` table:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Start the server:
   ```bash
   npm start
   ```

### 2. Setup the Frontend Client (`collab-editor`)
1. Open a new terminal and navigate to the `collab-editor` directory:
   ```bash
   cd collab-editor
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000/editor?room=my-first-room](http://localhost:3000/editor?room=my-first-room) in multiple browser windows to test real-time synchronization and live cursor presence.

---

## Production Deployment

### 1. Deploying `ws-server` to Railway

1. **Sign in to Railway**: Connect your GitHub repository.
2. **Add a Database**:
   * Click **New Project** -> **Provision PostgreSQL**.
3. **Deploy the Server**:
   * Click **New** -> **GitHub Repo** and select the repository.
   * In the service settings, set the **Root Directory** to `ws-server`.
4. **Configure Environment Variables**:
   * Under the **Variables** tab for the server service, reference the Postgres database Railway provisioned:
     ```env
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     PORT=8080
     ```
5. **Enable Public Domain**:
   * Go to **Settings** -> **Public Networking** and click **Generate Domain** to get your public backend URL (e.g. `https://ws-server-production.up.railway.app`).
6. **Apply Migrations**:
   * Ensure that `npx prisma migrate deploy` runs during your build/start step (can be configured in Railway's builder settings or added to your start script, e.g. `"start": "npx prisma migrate deploy && node server.js"`).

### 2. Deploying `collab-editor` to Vercel

1. **Sign in to Vercel**: Import the GitHub repository.
2. **Configure Project Settings**:
   * Set **Root Directory** to `collab-editor`.
   * Keep the framework preset as **Next.js**.
3. **Set Environment Variables**:
   * Add the public WebSocket server URL. Note the protocol should be `wss://` (secure WebSocket) since Vercel serves over HTTPS:
     * Name: `NEXT_PUBLIC_WS_SERVER_URL`
     * Value: `wss://ws-server-production.up.railway.app` (replace with your generated Railway domain).
4. **Deploy**: Click **Deploy**. Your collaborative editor is now live!
