"""
Invoice Page Object for InvParser application.
"""

import re
from playwright.sync_api import Page, expect
from .base_page import BasePage


class InvoicePage(BasePage):
    """Page object for the invoice details page."""
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def _verify_page_loaded(self):
        """Verify the invoice page is loaded."""
        if self.page.url and not re.search(r"/invoice/\d+", self.page.url):
            raise Exception("Invoice page not loaded successfully")
    
    def get_invoice_id_from_url(self):
        """Extract invoice ID from URL."""
        match = re.search(r"/invoice/(\d+)", self.page.url)
        if match:
            return match.group(1)
        return None
    
    def verify_invoice_url_pattern(self):
        """Verify we're on an invoice page with correct URL pattern."""
        expect(self.page).to_have_url(re.compile(r"/invoice/\d+"))
        return self
