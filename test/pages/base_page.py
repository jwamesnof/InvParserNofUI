"""
Base Page Object class with common functionality.
"""

import os
from playwright.sync_api import Page, expect


class BasePage:
    """Base class for all page objects."""
    
    def __init__(self, page: Page):
        self.page = page
        self.base_url = os.getenv('APP_URL', 'http://localhost:3000')
        self._verify_page_loaded()
    
    def _verify_page_loaded(self):
        """Override in subclasses to verify page is loaded correctly."""
        pass
    
    def goto(self, path: str):
        """Navigate to a specific path."""
        self.page.goto(f"{self.base_url}{path}")
    
    def get_title(self):
        """Get the page title."""
        return self.page.title()
    
    def wait_for_url(self, pattern, timeout=5000):
        """Wait for URL to match pattern."""
        expect(self.page).to_have_url(pattern, timeout=timeout)
