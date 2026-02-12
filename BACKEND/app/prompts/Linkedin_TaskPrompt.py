Task = """
CRITICAL DATA INTEGRITY RULES (STRICT ENFORCEMENT):
- NEVER use placeholder text like "Post 1 content..." or "Summary of post 2".
- If you can't find real text for a field, leave it EMPTY or return "".
- You MUST extract REAL content from the screen. If no posts are visible after clicking "Show all posts", report that no posts were found.
- Do NOT guess what the posts might be about.

STRICT BEHAVIORAL CONSTRAINTS:
- DO NOT click on social interaction buttons (Connect, Message, etc.).
- STAY FOCUSED on the data fields in the schema.

STEPS:
1. Navigate to: {linkedin_url} profile.
2. Sign in using the provided x_user and x_pass if not already logged in. Do NOT try to sign in multiple times.
3. Extract 'Full name', 'Profile headline', and a 'Profile summary' (the "About" section).

4. Extract Recent Posts (Maximum 5):
   - Scroll to the "Activity" section.
   - Click the "Show all posts" link/button. This is critical for full content.
   - For EACH of the top 5 updates/posts:
     - Click "see more" or "...more" if it exists to expand the text.
     - Extract the ACTUAL text of the post.
     - Summarize it briefly.
   - If there are fewer than 5 posts, just extract what is available. Do NOT invent posts to reach 5.

5. Extract Experience & Skills:
   - Go back to the profile if needed.
   - Extract the full list of Experiences (titles, companies, dates, descriptions).
   - Extract the full list of Skills from the "Skills" section.

6. Provide the final JSON result strictly matching the schema.
"""
