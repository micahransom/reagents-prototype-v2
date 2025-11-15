# Deployment Guide for Vercel

This guide will walk you through deploying the Abbott Prototype to Vercel with Postgres database.

## Prerequisites

- Vercel account (free tier works fine)
- Your project code pushed to GitHub/GitLab/Bitbucket

## Step 1: Install Dependencies

```bash
cd prototype
npm install
```

This will install Prisma and all other dependencies.

## Step 2: Set Up Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `prototype`
   - **Build Command:** (leave default)
   - **Output Directory:** (leave default)

**DO NOT deploy yet!** We need to add the database first.

## Step 3: Add Vercel Postgres Database

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose a name for your database (e.g., `abbott-db`)
5. Select a region (choose one close to your users)
6. Click **Create**

Vercel will automatically add the following environment variables to your project:
- `POSTGRES_PRISMA_URL` (for Prisma with connection pooling)
- `POSTGRES_URL_NON_POOLING` (for direct connection)
- And several others

## Step 4: Run Database Migration

After the database is created, you need to set up the tables:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Link your project:
```bash
cd prototype
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Run Prisma migration:
```bash
npx prisma migrate dev --name init
```

5. Push the schema to production:
```bash
npx prisma db push
```

### Option B: Using Vercel Dashboard

1. Go to your project settings → Environment Variables
2. Copy the `POSTGRES_URL_NON_POOLING` value
3. Create a local `.env` file:
```env
POSTGRES_PRISMA_URL="<your-pooled-url>"
POSTGRES_URL_NON_POOLING="<your-direct-url>"
```

4. Run Prisma migration:
```bash
npx prisma migrate dev --name init
```

## Step 5: Deploy to Vercel

Now you're ready to deploy!

### Via Git (Recommended)

1. Push your code to Git:
```bash
git add .
git commit -m "Add Postgres backend"
git push
```

2. Vercel will automatically deploy your changes

### Via Vercel CLI

```bash
vercel --prod
```

## Step 6: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Go to `/admin/categories` to create a category
3. Create an item to test the full workflow
4. Refresh the page - your data should persist!

## Local Development

For local development:

1. Pull environment variables from Vercel:
```bash
vercel env pull .env.local
```

2. Run the development server:
```bash
npm run dev
```

3. Visit `http://localhost:3000`

## Database Management

### View Your Data

You can view your database data in several ways:

1. **Prisma Studio:**
```bash
npx prisma studio
```

2. **Vercel Dashboard:**
   - Go to Storage → Your Database → Data tab

### Reset Database

⚠️ This will delete all data!

```bash
npx prisma migrate reset
```

### Backup Database

```bash
npx prisma db pull
```

## Troubleshooting

### "Can't reach database server"

- Make sure your environment variables are set correctly
- Check that you're using `POSTGRES_PRISMA_URL` for the app
- Try running `npx prisma generate`

### "Table doesn't exist"

- Run `npx prisma db push` to sync your schema
- Or run `npx prisma migrate deploy`

### Changes not showing

- Clear Vercel's cache and redeploy
- Make sure you pushed to the correct Git branch
- Check deployment logs in Vercel dashboard

## Environment Variables

The app automatically uses these environment variables (set by Vercel):

- `POSTGRES_PRISMA_URL` - Pooled connection for serverless functions
- `POSTGRES_URL_NON_POOLING` - Direct connection for migrations

No additional configuration needed!

## What's Next?

Your app is now deployed with a persistent database! All categories and items will be shared across all users and persist between deployments.

### Adding Features

To add new database fields:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_name`
3. Update your TypeScript types in `lib/types.ts`
4. Commit and push to deploy

Happy deploying! 🚀

