# SynapseMail Enterprise Backend

Production-ready NestJS backend for SynapseMail.

- External SMTP Delivery (Nodemailer + Resend/Brevo)
- Cross-domain support (Send to Gmail, Yahoo, etc.)
- Attachment streaming from GridFS to SMTP
- Automatic Retry Queue for failed external sends
- Global Audit Logging (mail_sent, mail_failed, external_delivery)
- Admin Dashboard APIs

## Deployment
### 1. Backend (Render.com)
The project includes a `render.yaml`. Connect your GitHub repo to Render and it will automatically detect the blueprint.
### 2. Frontend (Firebase Hosting)
Deploy using `firebase deploy`. Ensure `VITE_API_URL` points to your Render backend URL.

## Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with your MongoDB Atlas URI
4. `npm run start:dev`

## Default Admin
Email: `admin@synapse.com`
Password: `adminPassword123!`
(Seeded automatically on first run)

## API Structure
- `/auth`: Login/Logout
- `/mail`: Send, Inbox, Sent, Delete
- `/admin`: Stats, User Management, Logs
- `/attachment`: GridFS Upload/Download
- `/search`: Global Search
