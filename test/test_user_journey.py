import unittest
import os
import re
from playwright.sync_api import sync_playwright, expect


class TestUserJourney(unittest.TestCase):

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

    def test_login_and_upload_invoice(self):
        # 1. Login
        self.page.goto("http://localhost:3000/login")

        self.page.locator("input[type='text']").fill("admin")
        self.page.locator("input[type='password']").fill("admin")

        self.page.get_by_role(
            "button",
            name=re.compile(r"Sign In", re.IGNORECASE)
        ).click()

        expect(self.page).to_have_url(re.compile(r"/dashboard"))

        # 2. Go to upload page
        self.page.goto("http://localhost:3000/upload")
        expect(self.page).to_have_url(re.compile(r"/upload"))

        # 3. Upload PDF
        pdf_path = os.path.abspath(
            "sample_invoices/invoice_Aaron_Bergman_36259.pdf"
        )

        self.page.set_input_files(
            "input[type='file']",
            pdf_path
        )

        # 4. Click the upload / process button
        self.page.get_by_role(
            "button",
            name=re.compile(r"upload|process|extract", re.IGNORECASE)
        ).click()

        # 5. Wait for redirect to invoice page
        expect(self.page).to_have_url(
            re.compile(r"/invoice/\d+"),
            timeout=30000
        )

if __name__ == "__main__":
    unittest.main()

    

