import unittest
import os
import sys
import re
from playwright.sync_api import expect

# Add test directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import LoginPage, DashboardPage, UploadPage, InvoicePage
from browser_factory import BrowserFactory

# Get project root directory (one level up from test)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class TestUserJourney(unittest.TestCase):
    """
    Test complete user journeys using Page Object Model.
    Demonstrates page chaining for fluent interface testing.
    """

    @classmethod
    def setUpClass(cls):
        cls.factory = BrowserFactory()
        cls.factory.create_browser()
        cls.app_url = cls.factory.app_url

    @classmethod
    def tearDownClass(cls):
        cls.factory.close()

    def setUp(self):
        self.page = self.factory.create_page()
        # Handle ngrok warning if present
        self.factory.handle_ngrok_warning(self.page)

    def tearDown(self):
        # Take screenshot on failure
        if hasattr(self, '_outcome') and not self._outcome.success:
            test_name = self.id().split('.')[-1]
            self.page.screenshot(path=f'test_failure_{test_name}.png')
        self.page.close()

    def test_login_and_upload_invoice(self):
        """Test complete user journey: login → navigate to upload → upload file."""
        # Navigate to login page
        self.page.goto(f"{self.app_url}/login")
        login_page = LoginPage(self.page)

        # Login and verify dashboard
        dashboard = login_page.login_and_wait_for_dashboard("admin", "admin")
        dashboard.verify_dashboard_loaded() 
        
        # Navigate to upload page
        upload_page = dashboard.go_to_upload()

        # Upload PDF and verify redirect to invoice page
        pdf_path = os.path.join(PROJECT_ROOT, "sample_invoices", "invoice_Aaron_Bergman_36259.pdf")
        
        invoice_page = upload_page.upload_and_wait_for_invoice(pdf_path, timeout=30000)
        
        # Verify we're on the invoice page
        invoice_page.verify_invoice_url_pattern()
    
    def test_login_upload_with_chaining(self):
        """
        Test user journey using method chaining for fluent interface.
        Demonstrates the page chaining pattern from the POM guide.
        """
        self.page.goto(f"{self.app_url}/login")
        
        # Page chaining: login → dashboard → upload → invoice
        pdf_path = os.path.join(PROJECT_ROOT, "sample_invoices", "invoice_Aaron_Bergman_36259.pdf")
        invoice_page = (
            LoginPage(self.page)
            .login_as_valid_user("admin", "admin")  # returns DashboardPage
            .go_to_upload()  # returns UploadPage
            .upload_and_wait_for_invoice(  # returns InvoicePage
                pdf_path,
                timeout=30000
            )
        )
        
        # Verify final state
        invoice_id = invoice_page.get_invoice_id_from_url()
        self.assertIsNotNone(invoice_id, "Invoice ID should be present in URL")

    

