from browser_use import Tools, ActionResult, BrowserSession

tools = Tools()


def safe_text(text: str) -> str:
        if not text:
            return text
        return text.encode("utf-8", errors="ignore").decode("utf-8")


# -------------- SHOW ALL (POSTS) ----------------------------------------------
@tools.action(description="Click the 'Show all posts' link on LinkedIn profile")
async def click_show_all_posts(browser_session: BrowserSession):
    page = await browser_session.get_current_page()

    # Using robust selector for the show all posts button
    selector = 'a[data-view-name="profile-show-all-post-button"]:not([aria-disabled="true"])'
    
    try:
        await page.wait_for_selector(selector, timeout=5000)
        await page.click(selector)
        return ActionResult(extracted_content="Navigated to all posts page")
    except Exception as e:
        return ActionResult(extracted_content=f"Failed to click show all posts: {str(e)}")


# ----------------- (EXPERIENCE SECTION) ---------------------------------------------
@tools.action(description="Click the 'Show all experiences' button on LinkedIn profile")
async def click_show_all_experiences(browser_session: BrowserSession):
    page = await browser_session.get_current_page()

    selector = 'button[data-view-name="experience-see-all-experiences-button"]:not([aria-disabled="true"])'
    
    try:
        await page.wait_for_selector(selector, timeout=5000)
        await page.click(selector)
        return ActionResult(extracted_content="Opened full experience section")
    except Exception as e:
        return ActionResult(extracted_content=f"Could not find or click experiences button: {str(e)}")


# ------------------ SKILLS SECTION -------------------------------------------------------
@tools.action(description="Click the 'Show all skills' button on LinkedIn profile")
async def click_show_all_skills(browser_session: BrowserSession):
    page = await browser_session.get_current_page()

    selector = 'button[aria-label="Show all skills"]:not([aria-disabled="true"])'
    
    try:
        await page.wait_for_selector(selector, timeout=5000)
        await page.click(selector)
        return ActionResult(extracted_content="Opened full skills section")
    except Exception as e:
        return ActionResult(extracted_content=f"Could not find or click skills button: {str(e)}")


# @tools.action(description="Go back to the previous page")
# async def go_back(browser_session: BrowserSession):
#     page = await browser_session.get_current_page()
#     await page.go_back()
#     return ActionResult(extracted_content="Navigated back")

# @tools.action(description="Safely extract visible LinkedIn posts (emoji-safe)")
# async def extract_posts_safe(browser_session: BrowserSession):
#     page = await browser_session.get_current_page()

#     # Updated syntax to match environment requirements
#     raw_data = await page.evaluate("""(...args) => {
#         const posts = Array.from(document.querySelectorAll('.update-components-text'));
#         return posts.map((p, i) => ({
#             index: i + 1,
#             content: p.innerText.trim()
#         }));
#     }""")

#     if not raw_data:
#         return ActionResult(extracted_content="No posts found on the page")

#     import json
#     content_str = json.dumps(raw_data, ensure_ascii=True)
#     cleaned = safe_text(content_str)

#     return ActionResult(extracted_content=cleaned)


# @tools.action(description="Extract text from a section safely (emoji-safe)")
# async def universal_safe_extract(browser_session: BrowserSession, query: str):
#     """
#     Safely extract content from the current page based on a query.
#     This tool handles emoji encoding issues which often crash standard tools on Windows.
#     """
#     page = await browser_session.get_current_page()
    
#     # Use evaluate to get the body text or specific section text
#     # Here we just get the text content and let the LLM process the query based on it
#     # Alternatively, we could attempt a more complex extraction, but simple text grab is safer
#     # Use evaluate with the required anonymous function syntax
#     raw_text = await page.evaluate("(...args) => document.body.innerText")
    
#     # Prune text if too long (optional)
#     if len(raw_text) > 20000:
#         raw_text = raw_text[:20000] + "... [truncated]"
        
#     cleaned = safe_text(raw_text)
    
#     # We return the cleaned text. The agent's LLM will see this in the tool output
#     # and use it to fulfill the extraction goal.
#     return ActionResult(extracted_content=f"Extracted content for query '{query}':\n\n{cleaned}")





# @tools.action(description="Click the show all to get all the details here")
# async def click_next_button(browser_session: BrowserSession):
#     page = await browser_session.must_get_current_page()

#     button = await page.query_selector(
#         'button[data-testid="carousel-inline-right-button"]:not([disabled])'
#     )

#     if not button:
#         return ActionResult(extracted_content="Next button disabled or not found")

#     await button.scroll_into_view_if_needed()
#     await button.click()

#     return ActionResult(extracted_content="Carousel advanced")

