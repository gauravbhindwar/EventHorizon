## Getting Started

#Refence Link
 [https://eventhorizon-red.vercel.app/](https://eventhorizon-red.vercel.app/)

Before executing ```npm run dev ``` command create a ```.env``` and ```.env.local``` file and make sure all data in it is as same as ```.env.sample```

#```.env.sample```
```
NEXTAUTH_SECRET = your-next-auth-secret

NEXTAUTH_URl = your-next-auth-url            //default  -- http://localhost:3000

GITHUB_ID=your-githubId
GITHUB_SECRET=your-github-secret

# GOOGLE_ID=
# GOOGLE_SECRET=

# DATABASE_URL=postgresql://postgres:postgres@db:5432/mydatabase
DATABASE_URL=your-postgres-databaseurl

EMAIL_USER=your-email                 
EMAIL_PASS=your-email-password         // this is not your email login password

```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

