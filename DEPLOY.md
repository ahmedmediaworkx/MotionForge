# MotionForge - GitHub Pages Deployment

## Quick Deploy

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/MotionForge.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Under "Build and deployment":
     - Source: Select **Deploy from a branch**
     - Branch: Select **gh-pages** (after first deploy)
     - Or use the workflow option

3. **Update package.json:**
   - Edit `client/package.json` and replace `your-username` with your actual GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/MotionForge"
   ```

4. **Push again to trigger deployment:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages"
   git push
   ```

5. **Check deployment:**
   - Go to Actions tab to see the workflow running
   - After it completes, visit: `https://YOUR_USERNAME.github.io/MotionForge`

## Project Structure

```
MotionForge/
├── client/                 # React frontend
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml  # GitHub Actions workflow
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── server/                 # Node.js backend (not deployed)
```

## Note

The backend (server) is not deployed to GitHub Pages. You'll need to deploy it separately to a service like:
- Render
- Railway
- Heroku
- Vercel (backend functions)
- DigitalOcean

After deploying the backend, update the API URL in `client/src/services/api.js`.