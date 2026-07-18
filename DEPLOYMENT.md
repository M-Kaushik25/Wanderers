# Deployment Guide: Wanderers

This guide outlines how to deploy the Wanderers application to a production environment like Render, Railway, or Heroku.

## ⚠️ CRITICAL CAVEAT: SQLite and Ephemeral Filesystems

Wanderers uses **SQLite** as its database. SQLite stores data in a local file (`wanderers.db`).
Most modern cloud hosts (Render, Railway, Heroku) use **Ephemeral Filesystems**. This means that every time your app restarts, scales, or redeploys, the server is wiped clean and replaced with a fresh copy of your code. 

**If you deploy this app as-is to Heroku or the free tier of Render, your database will be deleted every time the server sleeps or restarts!**

### How to solve this:
1. **Option A (The Standard Way)**: Migrate to a managed database like PostgreSQL or MySQL. You would replace the `sqlite3` driver in `config/db.js` with `pg` (PostgreSQL) and update your SQL queries accordingly.
2. **Option B (The Easy Way)**: Use a host that supports **Persistent Disks** (e.g., Render's paid tier, or a traditional VPS like DigitalOcean Droplet / AWS EC2).

---

## 🚀 Deployment Steps (Render with Persistent Disk)

Assuming you are using Render and attaching a persistent disk so your SQLite database isn't wiped:

1. **Push your code to GitHub.**
   - Ensure `.env` is **NOT** pushed. Only `.env.example` should be in the repository.

2. **Create a new Web Service on Render.**
   - Connect your GitHub repository.

3. **Configure the Service:**
   - **Environment**: Node
   - **Build Command**: `npm install && npm run setup`
   - **Start Command**: `npm start`

4. **Add a Persistent Disk (Crucial for SQLite)**
   - Name: `data`
   - Mount Path: `/opt/render/project/src/data`
   - *Note: You must update `DATABASE_PATH` in your Environment Variables to point to this directory.*

5. **Set Environment Variables:**
   In the Render dashboard, add the variables from your `.env` file:
   - `PORT` = `3000`
   - `DATABASE_PATH` = `/opt/render/project/src/data/wanderers.db`
   - `JWT_SECRET` = `<generate-a-secure-random-string>`
   - `ADMIN_EMAIL` = `admin@wanderers.com`
   - `ADMIN_PASSWORD` = `<your-secure-password>`

6. **Deploy!**
   - Render will run `npm install`, then `npm run setup` (which builds the DB schema in the persistent disk), and finally `npm start`.

---

## 🛠️ Post-Deployment Checklist
- Navigate to your deployed URL.
- Test the booking form.
- Navigate to `/admin-login.html` and attempt to log in using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you provided in the environment variables.
- Verify that rate-limiting and security headers are active (Check Network tab for `X-Powered-By` omission).
