# Page Object Model (POM) Test Structure

This test suite follows the **Page Object Model** design pattern for improved maintainability and readability.

## Structure

```
test/
├── pages/                      # Page Object classes
│   ├── __init__.py            # Package exports
│   ├── base_page.py           # Base class with common functionality
│   ├── login_page.py          # Login page object
│   ├── dashboard_page.py      # Dashboard page object
│   ├── upload_page.py         # Upload page object
│   └── invoice_page.py        # Invoice details page object
├── components/                # Component-specific tests
│   └── test_upload_component.py
├── test_ui.py                 # Basic UI tests
└── test_user_journey.py       # End-to-end user journey tests
```

## Page Objects

### BasePage
Base class providing common functionality for all page objects:
- Page verification on initialization
- Navigation helpers
- URL verification methods

### LoginPage
Handles login page interactions:
```python
login_page = LoginPage(page)
dashboard = login_page.login_as_valid_user("admin", "admin")
```

### DashboardPage
Handles dashboard navigation:
```python
dashboard = DashboardPage(page)
upload_page = dashboard.go_to_upload()
```

### UploadPage
Handles file upload functionality:
```python
upload_page = UploadPage(page)
invoice_page = upload_page.upload_and_wait_for_invoice("path/to/file.pdf")
```

### InvoicePage
Handles invoice details page:
```python
invoice_page = InvoicePage(page)
invoice_id = invoice_page.get_invoice_id_from_url()
```

## Key Principles

### 1. Separation of Concerns
- **Page objects** contain locators and page interactions
- **Tests** contain assertions and test logic
- UI changes only require updates to page objects, not tests

### 2. Method Chaining
Page objects return other page objects to enable fluent interface:

```python
invoice_page = (
    LoginPage(page)
    .login_as_valid_user("admin", "admin")  # returns DashboardPage
    .go_to_upload()                          # returns UploadPage
    .upload_and_wait_for_invoice(pdf_path)   # returns InvoicePage
)
```

### 3. Page Verification
Each page object verifies it's loaded correctly in `_verify_page_loaded()`:
```python
def _verify_page_loaded(self):
    if self.page.url and "/upload" not in self.page.url:
        raise Exception("Upload page not loaded successfully")
```

### 4. No Assertions in Page Objects
Assertions belong in tests, not page objects:
```python
# ✅ Good - in test file
def test_upload_form_rendered(self):
    self.assertTrue(self.upload_page.is_heading_visible())

# ❌ Bad - don't put assertions in page objects
def is_heading_visible(self):
    assert self.page.locator("h1").is_visible()  # NO!
```

## Usage Examples

### Basic Test
```python
def test_login(self):
    self.page.goto("http://localhost:3000/login")
    login_page = LoginPage(self.page)
    dashboard = login_page.login_as_valid_user("admin", "admin")
    
    # Assertions in test
    self.assertIn("/dashboard", self.page.url)
```

### User Journey with Chaining
```python
def test_complete_workflow(self):
    self.page.goto("http://localhost:3000/login")
    
    invoice_page = (
        LoginPage(self.page)
        .login_as_valid_user("admin", "admin")
        .go_to_upload()
        .upload_and_wait_for_invoice("invoice.pdf")
    )
    
    invoice_id = invoice_page.get_invoice_id_from_url()
    self.assertIsNotNone(invoice_id)
```

### Error Handling
```python
def test_invalid_file(self):
    self.page.goto("http://localhost:3000/upload")
    upload_page = UploadPage(self.page)
    
    upload_page.upload_file("invalid.txt")
    upload_page.expect_invalid_file_error()
```

## Adding New Page Objects

1. Create new file in `test/pages/`
2. Inherit from `BasePage`
3. Define locators as class variables
4. Implement `_verify_page_loaded()`
5. Add methods that return other page objects for chaining

```python
from .base_page import BasePage

class NewPage(BasePage):
    # Locators
    SOME_BUTTON = "button.submit"
    
    def __init__(self, page):
        super().__init__(page)
    
    def _verify_page_loaded(self):
        if "/new-page" not in self.page.url:
            raise Exception("New page not loaded")
    
    def click_submit(self):
        self.page.locator(self.SOME_BUTTON).click()
        from .result_page import ResultPage
        return ResultPage(self.page)
```

## Benefits

✅ **Maintainability**: UI changes only affect page objects, not tests  
✅ **Readability**: Tests read like user stories  
✅ **Reusability**: Page objects shared across multiple tests  
✅ **Reduced Duplication**: Common actions centralized  
✅ **Type Safety**: Clear method contracts and return types  

## Running Tests

```bash
# Run all tests
python -m pytest test/

# Run specific test file
python -m pytest test/test_user_journey.py

# Run with unittest
python test/test_ui.py
```

## Authentication

Tests use Playwright's authentication storage to avoid repeated logins:
```python
# Save authentication state once
context.storage_state(path="playwright/.auth/user.json")

# Reuse in tests
context = browser.new_context(storage_state="playwright/.auth/user.json")
```
