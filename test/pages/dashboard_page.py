"""
Dashboard Page Object for InvParser application.
"""

import re
from playwright.sync_api import Page, expect
from .base_page import BasePage


class DashboardPage(BasePage):
    """Page object for the dashboard page."""
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def _verify_page_loaded(self):
        """Verify the dashboard page is loaded."""
        # Wait for navigation to dashboard to complete
        self.page.wait_for_url(re.compile(r".*/dashboard"), timeout=10000)
    
    def verify_dashboard_loaded(self):
        """Verify we're on the dashboard page."""
        expect(self.page).to_have_url(re.compile(r".*/dashboard"))
        return self
    
    def go_to_upload(self):
        """Navigate to the upload page."""
        self.goto("/upload")
        
        # Import here to avoid circular imports
        from .upload_page import UploadPage
        return UploadPage(self.page)
    
    def go_to_invoices(self):
        """Navigate to the invoices page."""
        self.goto("/invoices")
        return self
    
    def verify_dashboard_url(self):
        """Verify we're on the dashboard."""
        expect(self.page).to_have_url(re.compile(r"/dashboard"))
        return self
