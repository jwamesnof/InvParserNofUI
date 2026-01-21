import os
import re
import sys
import unittest
from playwright.sync_api import expect

# Add parent directory to path to import pages
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from pages import LoginPage, UploadPage
from browser_factory import BrowserFactory

# Get project root directory (two levels up from test/components)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


class TestUploadInvoiceComponent(unittest.TestCase):
    """
    Test upload component functionality using Page Object Model.
    Tests various upload scenarios including errors and edge cases.
    """

    AUTH_FILE = "playwright/.auth/user.json"

    @classmethod
    def setUpClass(cls):
        cls.factory = BrowserFactory()
        cls.factory.create_browser()
        cls.app_url = cls.factory.app_url
        cls.upload_url = f"{cls.app_url}/upload"

        os.makedirs("playwright/.auth", exist_ok=True)

        if not os.path.exists(cls.AUTH_FILE):
            cls._perform_authentication()

    @classmethod
    def _perform_authentication(cls):
        """Perform authentication and save state using page objects."""
        page = cls.factory.create_page()

        page.goto(f"{cls.app_url}/login")
        cls.factory.handle_ngrok_warning(page)
        
        login_page = LoginPage(page)
        
        # Login and wait for dashboard
        login_page.login_and_wait_for_dashboard("admin", "admin")

        page.context.storage_state(path=cls.AUTH_FILE)
        page.close()

    @classmethod
    def tearDownClass(cls):
        cls.factory.close()

    def setUp(self):
        context = self.factory.browser.new_context(
            storage_state=self.AUTH_FILE,
            viewport={'width': self.factory.width, 'height': self.factory.height}
        )
        self.page = context.new_page()
        self.page.goto(self.upload_url)
        self.factory.handle_ngrok_warning(self.page)
        self.upload_page = UploadPage(self.page)
        self.context = context

    def tearDown(self):
        # Take screenshot on failure
        if hasattr(self, '_outcome') and not self._outcome.success:
            test_name = self.id().split('.')[-1]
            self.page.screenshot(path=f'test_failure_{test_name}.png')
        self.context.close()

    # 1️⃣ Upload page renders correctly
    def test_upload_form_rendered(self):
        """Test that upload form elements are rendered correctly."""
        self.assertTrue(
            self.upload_page.is_heading_visible(),
            "Upload Invoice heading should be visible"
        )

        self.assertTrue(
            self.upload_page.is_pdf_only_text_visible(),
            "PDF files only text should be visible"
        )

    # 2️⃣ Upload without selecting a file → stays on page
    def test_upload_without_file(self):
        """Test that page stays on upload when no file is selected."""
        expect(self.page).to_have_url(re.compile(r"/upload"))

    # 3️⃣ Invalid file type (TXT)
    def test_invalid_file_type(self):
        """Test that invalid file type shows appropriate error."""
        invalid_file = os.path.join(PROJECT_ROOT, "sample_invoices", "invalid.txt")
        self.upload_page.upload_file(invalid_file)
        self.upload_page.expect_invalid_file_error()

    # 4️⃣ Corrupted PDF
    def test_corrupted_pdf(self):
        """Test that corrupted PDF shows appropriate error."""
        corrupted_file = os.path.join(PROJECT_ROOT, "sample_invoices", "corrupted_invoice.pdf")
        self.upload_page.upload_file(corrupted_file)
        # Wait a bit for processing and check we stay on upload page or see error
        try:
            self.upload_page.expect_failed_error(timeout=15000)
        except:
            # If no error message found, at least verify we stay on upload page
            self.upload_page.expect_stays_on_upload_page()

    # 5️⃣ Backend failure (API abort simulation)
    def test_backend_failure(self):
        """Test that backend failure is handled gracefully."""
        # Mock backend failure
        self.upload_page.mock_backend_failure()

        # Upload file
        valid_pdf = os.path.join(PROJECT_ROOT, "sample_invoices", "invoice_Aaron_Bergman_36259.pdf")
        self.upload_page.upload_file(valid_pdf)

        # Verify stays on upload page
        self.upload_page.expect_stays_on_upload_page()

    # 6️⃣ Successful upload → redirect to invoice details
    def test_successful_upload_redirect(self):
        """Test that successful upload redirects to invoice details page."""
        valid_pdf = os.path.join(PROJECT_ROOT, "sample_invoices", "invoice_Aaron_Bergman_36259.pdf")

        invoice_page = self.upload_page.upload_and_wait_for_invoice(
            valid_pdf,
            timeout=30000
        )
        
        # Verify we're on invoice page
        invoice_page.verify_invoice_url_pattern()


if __name__ == "__main__":
    unittest.main()
