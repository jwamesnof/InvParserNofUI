import unittest
import sys
import os

# Add test directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import LoginPage, DashboardPage
from browser_factory import BrowserFactory


class TestInvParserUI(unittest.TestCase):
    """Test suite for InvParser UI using Page Object Model."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the browser once for all tests in this class."""
        cls.factory = BrowserFactory()
        cls.factory.create_browser()
        cls.app_url = cls.factory.app_url
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests are done."""
        cls.factory.close()

    def setUp(self):
        """Set up before each test method."""
        self.page = self.factory.create_page()
        self.factory.handle_ngrok_warning(self.page)
    
    def tearDown(self):
        """Clean up after each test method."""
        if hasattr(self, '_outcome') and not self._outcome.success:
            test_name = self.id().split('.')[-1]
            self.page.screenshot(path=f'test_failure_{test_name}.png')
        self.page.close()
    
    def test_page_title(self):
        """Test that the page title is correct."""
        self.page.goto(self.app_url)
        # Handle ngrok warning page
        self.factory.handle_ngrok_warning(self.page)
        # Wait for page to load
        self.page.wait_for_load_state("networkidle", timeout=10000)
        title = self.page.title()
        self.assertEqual("InvParser - Invoice Management", title)
    
    def test_login_page_loads(self):
        """Test that the login page loads correctly."""
        self.page.goto(f"{self.app_url}/login")
        # Handle ngrok warning page
        self.factory.handle_ngrok_warning(self.page)
        # Wait for page to load
        self.page.wait_for_load_state("networkidle", timeout=10000)
        login_page = LoginPage(self.page)
        
        # Page object initialization verifies page loaded
        self.assertIn("/login", self.page.url)


if __name__ == "__main__":
    unittest.main()