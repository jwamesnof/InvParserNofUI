import unittest
import sys
import os
from playwright.sync_api import sync_playwright

# Add test directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import LoginPage, DashboardPage


class TestInvParserUI(unittest.TestCase):
    """Test suite for InvParser UI using Page Object Model."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the browser once for all tests in this class."""
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=False)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests are done."""
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        """Set up before each test method."""
        self.page = self.browser.new_page()
    
    def tearDown(self):
        """Clean up after each test method."""
        self.page.close()
    
    def test_page_title(self):
        """Test that the page title is correct."""
        self.page.goto("http://localhost:3000")
        title = self.page.title()
        self.assertIn("InvParser", title)
    
    def test_login_page_loads(self):
        """Test that the login page loads correctly."""
        self.page.goto("http://localhost:3000/login")
        login_page = LoginPage(self.page)
        
        # Page object initialization verifies page loaded
        self.assertIn("/login", self.page.url)


if __name__ == "__main__":
    unittest.main()