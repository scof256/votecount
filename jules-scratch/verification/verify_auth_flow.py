from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the homepage
        page.goto("http://localhost:3000/")

        # Verify the unauthenticated state
        expect(page.get_by_text("You are not signed in.")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_homepage_unauthenticated.png")

        # Navigate to the login page
        page.get_by_role("link", name="Sign In").click()

        # Verify the login page
        expect(page.get_by_role("heading", name="Sign In")).to_be_visible()
        expect(page.get_by_label("Email")).to_be_visible()
        expect(page.get_by_label("Password")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_login_page.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)