"""
Browser Factory for CI/CD Testing
Handles browser creation based on environment variables for different browsers and screen resolutions.
Aligned with playwright-tests.yml workflow strategy.
"""

import os
from playwright.sync_api import sync_playwright, Browser, Page, Playwright


class BrowserFactory:
    """
    Factory class to create browser instances based on environment variables.
    
    Supported environment variables:
    - BROWSER: chrome, firefox (default: chrome)
    - SCREEN_WIDTH: viewport width in pixels (default: 1920)
    - SCREEN_HEIGHT: viewport height in pixels (default: 1080)
    - HEADLESS: true/false (default: false)
    - APP_URL: application URL (default: http://localhost:3000)
    - TEST_NAME: test identifier for logging (optional)
    """
    
    def __init__(self):
        self.browser_type = os.getenv('BROWSER', 'chrome').lower()
        self.width = int(os.getenv('SCREEN_WIDTH', '1920'))
        self.height = int(os.getenv('SCREEN_HEIGHT', '1080'))
        self.headless = os.getenv('HEADLESS', 'false').lower() == 'true'
        self.app_url = os.getenv('APP_URL', 'http://localhost:3000')
        self.test_name = os.getenv('TEST_NAME', 'local-test')
        self.slow_mo = 0 if self.headless else 500
        self.playwright: Playwright | None = None
        self.browser: Browser | None = None
        
        # Log configuration for debugging
        self._log_config()
    
    def _log_config(self):
        """Log browser factory configuration for debugging."""
        if os.getenv('CI'):  # Only log in CI environment
            print(f"[BrowserFactory] Configuration:")
            print(f"  - Browser: {self.browser_type}")
            print(f"  - Resolution: {self.width}x{self.height}")
            print(f"  - Headless: {self.headless}")
            print(f"  - App URL: {self.app_url}")
            print(f"  - Test Name: {self.test_name}")
    
    def create_browser(self) -> Browser:
        """
        Create and return a browser instance based on BROWSER environment variable.
        Supports: chrome (chromium), firefox, webkit
        """
        self.playwright = sync_playwright().start()
        
        launch_options = {
            'headless': self.headless,
            'slow_mo': self.slow_mo
        }
        
        # Add CI-specific options
        if os.getenv('CI'):
            launch_options['args'] = [
                '--disable-dev-shm-usage',  # Overcome limited resource problems
                '--no-sandbox',  # Required for CI environments
            ]
        
        # Map browser types (chrome maps to chromium)
        browser_map = {
            'chrome': 'chromium',
            'chromium': 'chromium',
            'firefox': 'firefox',
            'webkit': 'webkit',
            'safari': 'webkit'
        }
        
        browser_engine = browser_map.get(self.browser_type, 'chromium')
        
        if browser_engine == 'chromium':
            self.browser = self.playwright.chromium.launch(**launch_options)
        elif browser_engine == 'firefox':
            self.browser = self.playwright.firefox.launch(**launch_options)
        elif browser_engine == 'webkit':
            self.browser = self.playwright.webkit.launch(**launch_options)
        
        return self.browser
    
    def create_page(self) -> Page:
        """
        Create and return a page with the configured viewport.
        Viewport size is set based on SCREEN_WIDTH and SCREEN_HEIGHT env vars.
        """
        if not self.browser:
            self.create_browser()
        
        context_options = {
            'viewport': {'width': self.width, 'height': self.height},
            'user_agent': self._get_user_agent()
        }
        
        context = self.browser.new_context(**context_options)
        page = context.new_page()
        return page
    
    def _get_user_agent(self) -> str:
        """Get appropriate user agent string based on resolution."""
        if self.width <= 375:  # Mobile
            return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        elif self.width <= 768:  # Tablet
            return 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        else:  # Desktop
            return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    def get_resolution_name(self) -> str:
        """Get a human-readable name for current resolution."""
        if self.width <= 375:
            return 'mobile'
        elif self.width <= 768:
            return 'tablet'
        else:
            return 'desktop'
    
    def get_app_url(self, path: str = '') -> str:
        """Get the full app URL with optional path."""
        return f"{self.app_url}{path}"
    
    def handle_ngrok_warning(self, page: Page):
        """
        Handle Ngrok warning page if present.
        Ngrok shows a warning page before allowing access to the tunneled site.
        """
        try:
            # Wait briefly for ngrok warning page
            visit_button = page.get_by_role("button", name="Visit Site")
            if visit_button.is_visible(timeout=2000):
                visit_button.click()
                page.wait_for_load_state("networkidle", timeout=5000)
        except:
            pass  # No ngrok warning page or already dismissed
    
    def close(self):
        """Close browser and playwright."""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()


# Singleton instance for tests
_factory_instance = None


def get_browser_factory() -> BrowserFactory:
    """Get or create the singleton browser factory instance."""
    global _factory_instance
    if _factory_instance is None:
        _factory_instance = BrowserFactory()
    return _factory_instance


def reset_browser_factory():
    """Reset the singleton instance (useful for testing)."""
    global _factory_instance
    if _factory_instance:
        _factory_instance.close()
    _factory_instance = None
