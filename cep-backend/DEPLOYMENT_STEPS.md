# Deployment Steps for CEP Backend on EC2

## On Local Machine (Windows)

1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Build dist folder"
   git push origin main
   ```

## On EC2 Instance (Ubuntu)

1. **Navigate to project directory:**
   ```bash
   cd ~/CEP_Project/cep-backend
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the application:**
   ```bash
   npm start
   ```
   
   This will run: `node dist/index.js`

## Environment Variables

Create a `.env` file in the `/home/ubuntu/CEP_Project/cep-backend` directory with:
```
PORT=8787
FRONTEND_URL=your_frontend_url

# MySQL (AWS RDS)
DB_HOST=your_rds_host
DB_PORT=3306
DB_NAME=fern_helper
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# AWS S3 (images are stored here)
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Supabase (used only for /user endpoints)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Other API keys
GOOGLE_API_KEY=your_google_api_key
RESEND_API_KEY=your_resend_key
```

## Data Flow

- Plant image files are uploaded to AWS S3 and only the `image_url` is stored in the database.
- Plant records are stored in AWS RDS MySQL (`fern_helper` database, `plants` table).
- Image binary is not stored in MySQL.
- User endpoints continue using Supabase.

## Running in Background with PM2 (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app with PM2
pm2 start "npm start" --name "cep-backend"

# Make it restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs cep-backend
```

## Troubleshooting

**If dist folder is missing:**
- Ensure `npm run build` was run locally
- Check that the Git push included the dist folder
- Do: `git pull origin main` to get the latest dist

**If modules not found:**
- Run: `npm install`
- Verify all .env variables are set

**To stop the server:**
```bash
pm2 stop cep-backend
```

---

## Optional: Deploying with Docker (used in this project)

Instead of running `node` directly on the EC2 instance, this project also supports
running the backend inside a Docker container using the `Dockerfile` in `cep-backend/`.

### Build image locally or on EC2

```bash
cd cep-backend
docker build -t cep-backend .
```

### Run container with environment variables

Create a `.env` file (see the "Environment Variables" section above), then:

```bash
docker run --env-file .env -p 8787:8787 -d --name cep-backend cep-backend
```

This is the approach used on the EC2 instance so that the backend runs in a
reproducible containerized environment.

