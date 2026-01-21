"""
Login Page Object for InvParser application.
"""

import re
from playwright.sync_api import Page, expect
from .base_page import BasePage


class LoginPage(BasePage):
    """Page object for the login page."""
    
    # Locators
    USERNAME_INPUT = "input[type='text']"
    PASSWORD_INPUT = "input[type='password']"
    SIGN_IN_BUTTON_NAME = re.compile(r"Sign In", re.IGNORECASE)
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def _verify_page_loaded(self):
        """Verify the login page is loaded."""
        if self.page.url and "/login" not in self.page.url:
            raise Exception("Login page not loaded successfully")
    
    def fill_username(self, username: str):
        """Fill in the username field."""
        self.page.locator(self.USERNAME_INPUT).fill(username)
        return self
    
    def fill_password(self, password: str):
        """Fill in the password field."""
        self.page.locator(self.PASSWORD_INPUT).fill(password)
        return self
    
    def click_sign_in(self):
        """Click the sign in button and return DashboardPage."""
        self.page.get_by_role("button", name=self.SIGN_IN_BUTTON_NAME).click()
        
        # Wait for navigation to complete
        self.page.wait_for_url(re.compile(r".*/dashboard"), timeout=10000)
        
        # Import here to avoid circular imports
        from .dashboard_page import DashboardPage
        return DashboardPage(self.page)
    
    def login_as_valid_user(self, username: str, password: str):
        """Complete login flow with valid credentials."""
        self.fill_username(username)
        self.fill_password(password)
        return self.click_sign_in()
    
    def login_and_wait_for_dashboard(self, username: str, password: str):
        """Login and wait for dashboard URL."""
        dashboard = self.login_as_valid_user(username, password)
        expect(self.page).to_have_url(re.compile(r"/dashboard"))
        return dashboard
