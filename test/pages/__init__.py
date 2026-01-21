"""
Page Object Model classes for UI testing.
"""

from .base_page import BasePage
from .login_page import LoginPage
from .dashboard_page import DashboardPage
from .upload_page import UploadPage
from .invoice_page import InvoicePage

__all__ = [
    'BasePage',
    'LoginPage',
    'DashboardPage',
    'UploadPage',
    'InvoicePage',
]
