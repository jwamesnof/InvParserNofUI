import os
import re
import unittest
from playwright.sync_api import sync_playwright, expect


class TestUploadInvoiceComponent(unittest.TestCase):

    AUTH_FILE = "playwright/.auth/user.json"
    UPLOAD_URL = "http://localhost:3000/upload"

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=False)

        os.makedirs("playwright/.auth", exist_ok=True)

        if not os.path.exists(cls.AUTH_FILE):
            cls._perform_authentication()

    @classmethod
    def _perform_authentication(cls):
        context = cls.browser.new_context()
        page = context.new_page()

        page.goto("http://localhost:3000/login")
        page.locator("input[type='text']").fill("admin")
        page.locator("input[type='password']").fill("admin")

        page.get_by_role(
            "button",
            name=re.compile("sign in", re.I)
        ).click()

        page.wait_for_url("**/dashboard")

        context.storage_state(path=cls.AUTH_FILE)
        context.close()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(
            storage_state=self.AUTH_FILE
        )
        self.page = self.context.new_page()
        self.page.goto(self.UPLOAD_URL)

    def tearDown(self):
        self.context.close()

    # 1️⃣ Upload page renders correctly
    def test_upload_form_rendered(self):
            expect(
                self.page.get_by_role("heading", name=re.compile("^Upload Invoice$"))
            ).to_be_visible()

            expect(
                self.page.get_by_text(re.compile("PDF files only", re.I))
            ).to_be_visible()

    # 2️⃣ Upload without selecting a file → stays on page
    def test_upload_without_file(self):
        expect(self.page).to_have_url(
            re.compile(r"/upload")
        )

    # 3️⃣ Invalid file type (TXT)
    def test_invalid_file_type(self):
        self.page.set_input_files(
            'input[type="file"]',
            "sample_invoices/invalid.txt"
        )

        error = self.page.get_by_text(
            "Invalid file type. Only PDF files are supported",
            exact=False
        )

        expect(error).to_be_visible(timeout=10000)

    # 4️⃣ Corrupted PDF
    def test_corrupted_pdf(self):
        self.page.set_input_files(
            'input[type="file"]',
            "sample_invoices/corrupted_invoice.pdf"
        )

        expect(
            self.page.get_by_text(re.compile("failed|error|corrupt", re.I))
        ).to_be_visible(timeout=10_000)

    # 5️⃣ Backend failure (API abort simulation)

    def test_backend_failure(self):
        self.page.route(
            re.compile(r".*/extract"),
            lambda route: route.fulfill(status=500)
        )

        self.page.set_input_files(
            'input[type="file"]',
            "sample_invoices/invoice_Aaron_Bergman_36259.pdf"
        )

        # Do NOT click "Browse Files"
        # Upload is triggered automatically after file selection

        expect(self.page).to_have_url(
            re.compile(r"/upload"),
            timeout=10_000
        )


    # 6️⃣ Successful upload → redirect to invoice details
    def test_successful_upload_redirect(self):
        valid_pdf = os.path.abspath(
            "sample_invoices/invoice_Aaron_Bergman_36259.pdf"
        )

        self.page.set_input_files(
            "input[type='file']",
            valid_pdf
        )

        expect(self.page).to_have_url(
            re.compile(r"/invoice/\d+"),
            timeout=30000
        )

