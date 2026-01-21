import unittest
import os
import sys
import re
from playwright.sync_api import sync_playwright, expect

# Add test directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import LoginPage, DashboardPage, UploadPage, InvoicePage

# Get project root directory (one level up from test)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class TestUserJourney(unittest.TestCase):
    """
    Test complete user journeys using Page Object Model.
    Demonstrates page chaining for fluent interface testing.
    """

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=False,
            slow_mo=500
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page()

    def tearDown(self):
        self.page.close()

    def test_login_and_upload_invoice(self):
        """Test complete user journey: login → navigate to upload → upload file."""
        # Navigate to login page
        self.page.goto("http://localhost:3000/login")
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
        self.page.goto("http://localhost:3000/login")
        
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

    

