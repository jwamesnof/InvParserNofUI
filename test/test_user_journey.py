import unittest
from playwright.sync_api import sync_playwright, expect
import os


class TestUserJourney(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=False)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page()

    def test_login_and_upload_invoice(self):
        # 1. Go to login page
        self.page.goto("http://localhost:3004/login")

        # 2. Perform login
        self.page.get_by_label("Username").fill("admin")
        self.page.get_by_label("Password").fill("admin")
        self.page.get_by_role("button", name="Login").click()

        # 3. Expect redirect to dashboard
        expect(self.page).to_have_url("http://localhost:3004/dashboard")

        # 4. Navigate to upload page
        self.page.goto("http://localhost:3004/upload")

        # 5. Upload a PDF invoice
        pdf_path = os.path.abspath("tests/sample_invoice.pdf")
        self.page.set_input_files("input[type='file']", pdf_path)

        # 6. Click upload button
        self.page.get_by_role("button", name="Upload").click()

        # 7. Expect success message or redirect
        expect(self.page.locator("text=Upload successful")).to_be_visible()
