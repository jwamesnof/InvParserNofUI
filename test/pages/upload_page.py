"""
Upload Page Object for InvParser application.
"""

import re
from playwright.sync_api import Page, expect
from .base_page import BasePage


class UploadPage(BasePage):
    """Page object for the upload page."""
    
    # Locators
    FILE_INPUT = "input[type='file']"
    HEADING = re.compile("^Upload Invoice$")
    PDF_ONLY_TEXT = re.compile("PDF only", re.I)
    UPLOAD_BUTTON = re.compile(r"upload|process|extract", re.IGNORECASE)
    INVALID_FILE_ERROR = "Invalid file type. Only PDF files are supported"
    FAILED_ERROR = re.compile("failed|error|corrupt", re.I)
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def _verify_page_loaded(self):
        """Verify the upload page is loaded."""
        if self.page.url and "/upload" not in self.page.url:
            raise Exception("Upload page not loaded successfully")
    
    def is_heading_visible(self):
        """Check if the upload heading is visible."""
        try:
            heading = self.page.get_by_role("heading", name=self.HEADING)
            heading.wait_for(state="visible", timeout=5000)
            return heading.is_visible()
        except:
            return False
    
    def is_pdf_only_text_visible(self):
        """Check if the PDF only text is visible."""
        try:
            # Use first() to handle multiple matches
            return self.page.get_by_text(self.PDF_ONLY_TEXT).first.is_visible()
        except:
            return False
    
    def upload_file(self, file_path: str):
        """Upload a file by setting the file input."""
        self.page.set_input_files(self.FILE_INPUT, file_path)
        return self
    
    def click_upload_button(self):
        """Click the upload/process button."""
        self.page.get_by_role("button", name=self.UPLOAD_BUTTON).click()
        return self
    
    def upload_file_and_click(self, file_path: str):
        """Upload a file and click the upload button."""
        self.upload_file(file_path)
        self.click_upload_button()
        return self
    
    def upload_and_wait_for_invoice(self, file_path: str, timeout=30000):
        """Upload a file and wait for redirect to invoice page."""
        self.upload_file(file_path)
        # Wait for redirect after auto-upload
        expect(self.page).to_have_url(re.compile(r"/invoice/\d+"), timeout=timeout)
        
        # Import here to avoid circular imports
        from .invoice_page import InvoicePage
        return InvoicePage(self.page)
    
    def expect_invalid_file_error(self, timeout=10000):
        """Wait for and verify invalid file type error is visible."""
        error = self.page.get_by_text(self.INVALID_FILE_ERROR, exact=False)
        expect(error).to_be_visible(timeout=timeout)
        return self
    
    def expect_failed_error(self, timeout=10000):
        """Wait for and verify failed/error/corrupt message is visible."""
        expect(self.page.get_by_text(self.FAILED_ERROR)).to_be_visible(timeout=timeout)
        return self
    
    def expect_stays_on_upload_page(self, timeout=10000):
        """Verify that page stays on upload URL."""
        expect(self.page).to_have_url(re.compile(r"/upload"), timeout=timeout)
        return self
    
    def mock_backend_failure(self):
        """Set up route to mock backend API failure."""
        self.page.route(
            re.compile(r".*/extract"),
            lambda route: route.fulfill(status=500)
        )
        return self
