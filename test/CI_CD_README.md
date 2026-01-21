# CI/CD Setup for Playwright Tests

## Overview

This project includes automated UI testing using Playwright and GitHub Actions CI/CD pipeline.

## Local Testing

### Prerequisites

1. Install Python dependencies:
```bash
cd test
pip install -r requirements.txt
```

2. Install Playwright browsers:
```bash
playwright install chromium firefox
```

### Running Tests Locally

Run all tests with default settings (Chrome, desktop resolution):
```bash
cd test
python test_ui.py
python test_user_journey.py
python components/test_upload_component.py
```

Or use pytest:
```bash
cd test
pytest test_ui.py test_user_journey.py components/test_upload_component.py -v
```

### Testing with Different Browsers and Resolutions

You can test different configurations using environment variables:

**Chrome in headless mode:**
```bash
HEADLESS=true BROWSER=chrome python test_user_journey.py
```

**Firefox with tablet resolution:**
```bash
BROWSER=firefox SCREEN_WIDTH=768 SCREEN_HEIGHT=1024 python test_user_journey.py
```

**Mobile resolution:**
```bash
SCREEN_WIDTH=375 SCREEN_HEIGHT=667 python test_user_journey.py
```

## CI/CD Pipeline

The GitHub Actions workflow runs tests automatically on:
- Pull requests to `main` branch
- Manual trigger via GitHub Actions UI

### Workflow Features

✅ **Matrix Testing**: Runs tests in parallel across:
- 2 browsers: Chrome and Firefox
- 3 resolutions: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- Total: 6 parallel test jobs

✅ **Screenshot Artifacts**: On test failure, screenshots are uploaded as artifacts

✅ **Manual Trigger**: Run tests on-demand with custom browser/resolution selection

## Setting up Ngrok for CI/CD

Since GitHub Actions needs to access your local app, use Ngrok:

### 1. Sign up and Install Ngrok
```bash
# Sign up at https://ngrok.com/
# Download and install ngrok

# Authenticate (one-time setup)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 2. Start Your App
```bash
npm run dev
```

### 3. Expose via Ngrok
```bash
ngrok http 3000
```

Or use a static domain (recommended):
```bash
ngrok http 3000 --url=your-static-domain.ngrok-free.app
```

### 4. Add Ngrok URL to GitHub Secrets

1. Go to your repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NGROK_URL`
5. Value: Your ngrok URL (e.g., `https://your-subdomain.ngrok-free.app`)

## Branch Protection

To prevent direct pushes to `main`:

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Search and add these required checks:
     - `Test chrome - desktop`
     - `Test chrome - tablet`
     - `Test chrome - mobile`
     - `Test firefox - desktop`
     - `Test firefox - tablet`
     - `Test firefox - mobile`
4. Click **Create**

## Architecture

### BrowserFactory
The `browser_factory.py` module handles browser creation based on environment variables:
- `BROWSER`: chrome, firefox, or webkit (default: chrome)
- `SCREEN_WIDTH`: viewport width (default: 1920)
- `SCREEN_HEIGHT`: viewport height (default: 1080)
- `HEADLESS`: true/false (default: false)
- `APP_URL`: application URL (default: http://localhost:3000)

### Test Structure
```
test/
├── browser_factory.py      # Browser configuration
├── requirements.txt         # Python dependencies
├── test_ui.py              # Basic UI tests
├── test_user_journey.py    # User journey tests
├── components/
│   └── test_upload_component.py  # Component-specific tests
└── pages/
    ├── base_page.py        # Base page object
    ├── login_page.py       # Login page object
    ├── dashboard_page.py   # Dashboard page object
    ├── upload_page.py      # Upload page object
    └── invoice_page.py     # Invoice page object
```

## Environment Variables Reference

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `BROWSER` | Browser to use | `chrome` | chrome, firefox, webkit |
| `SCREEN_WIDTH` | Viewport width | `1920` | Any integer |
| `SCREEN_HEIGHT` | Viewport height | `1080` | Any integer |
| `HEADLESS` | Run without GUI | `false` | true, false |
| `APP_URL` | Application URL | `http://localhost:3000` | Any URL |

## Troubleshooting

### Tests fail in CI but pass locally
- Check that `NGROK_URL` secret is set correctly
- Ensure your app is running and accessible via ngrok
- Check workflow logs for specific errors

### Ngrok warning page appears
The BrowserFactory automatically handles the ngrok warning page. If issues persist:
- Use a static ngrok domain
- Check the `handle_ngrok_warning()` method

### Screenshots not uploaded
- Screenshots are only uploaded when `if: always()` is set in workflow
- Check the **Actions** tab → Select failed workflow → **Artifacts** section

## Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **Playwright UI Tests** workflow
3. Click **Run workflow**
4. Select browser and resolution
5. Click **Run workflow** button
