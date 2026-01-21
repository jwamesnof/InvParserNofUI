# Running Tests with Page Object Model

## Prerequisites

Before running the tests, ensure you have:

1. **Python dependencies installed:**
   ```bash
   pip install playwright pytest-playwright
   ```

2. **Playwright browsers installed:**
   ```bash
   python -m playwright install chromium
   ```

3. **Application running:**
   The tests require the Next.js application to be running on `http://localhost:3000`
   
   In a separate terminal:
   ```bash
   npm run dev
   ```

## Running Tests

### From the test directory:

```bash
cd test
python test_user_journey.py
```

### Run specific test:

```bash
cd test
python -m unittest test_user_journey.TestUserJourney.test_login_and_upload_invoice
```

### Run all tests in a file:

```bash
cd test
python test_ui.py
python test_user_journey.py
python components/test_upload_component.py
```

### Using pytest:

```bash
# Run all tests
pytest test/ -v

# Run specific file
pytest test/test_user_journey.py -v

# Run specific test
pytest test/test_user_journey.py::TestUserJourney::test_login_upload_with_chaining -v
```

## Test Files

- **test_ui.py** - Basic UI tests
- **test_user_journey.py** - End-to-end user journey tests with page chaining
- **components/test_upload_component.py** - Upload component tests with various scenarios

## Authentication

The `test_upload_component.py` uses Playwright's authentication storage to avoid repeated logins:
- First run creates `playwright/.auth/user.json`
- Subsequent runs reuse the saved authentication state

## Test Configuration

Tests run with:
- **Browser:** Chromium (visible by default: `headless=False`)
- **Speed:** Slow motion enabled for user journey tests (`slow_mo=500`)

To run headless (no browser window):
1. Edit the test file
2. Change `headless=False` to `headless=True` in the `setUpClass` method

## Troubleshooting

### ImportError: No module named 'pages'
- Ensure you're running tests from the `test/` directory
- Or add `sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))` to your test file

### Connection refused to localhost:3000
- Make sure the Next.js app is running: `npm run dev`
- Verify it's running on port 3000

### Browser not opening
- Check Playwright installation: `python -m playwright install --help`
- Reinstall browsers: `python -m playwright install chromium`

### Tests failing after UI changes
- Update only the affected page objects in `test/pages/`
- Tests themselves should not need changes (that's the power of POM!)

## Example Test Output

```
test_login_and_upload_invoice (__main__.TestUserJourney)
Test complete user journey: login → navigate to upload → upload file. ... ok
test_login_upload_with_chaining (__main__.TestUserJourney)
Test user journey using method chaining for fluent interface. ... ok

----------------------------------------------------------------------
Ran 2 tests in 45.123s

OK
```
