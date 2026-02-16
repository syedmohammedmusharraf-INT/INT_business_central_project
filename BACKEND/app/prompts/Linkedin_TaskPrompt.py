Task = """
MISSION:
You are an expert LinkedIn data extraction specialist. Your goal is to gather highly accurate, REAL profile data and recent activity for the user at {linkedin_url}. 

CRITICAL DATA INTEGRITY RULES:
1. NEVER use placeholders (e.g., "Post 1 text..."). Only extract REAL content.
2. If a section is missing or empty, return an empty string "" or an empty list [].
3. Handle encoding issues by ignoring emojis if they cause tool failures.
4. DO NOT click 'Connect', 'Message', or follow buttons.

EXTRACTION STEPS:

1. AUTHENTICATION & NAVIGATION:
   - Navigate to: {linkedin_url}
   - If a login wall appears, use documented credentials: x_user and x_pass from sensitive_data. 
   - DO NOT attempt multiple logins if one fails.

2. CORE PROFILE DATA:
   - Extract 'Full name', 'Profile headline', and 'About' summary.
   - Use page scrolling to ensure elements are loaded.

3. RECENT ACTIVITY (CRITICAL):
   - Locate the 'Activity' or 'Posts' section.
   - USE THE CUSTOM TOOL `click_show_all_posts` to navigate to the full activity feed. 
   - Once on the posts page, extract the top 5 REAL posts.
   - For each post, click "see more" if the text is truncated.
   - Provided REAL text and a concise summary for each.

4. EXPERIENCE & SKILLS:
   - Go back to the main profile or navigate directly to sections.
   - USE THE CUSTOM TOOL `click_show_all_experiences` if the profile has many entries.
   - USE THE CUSTOM TOOL `click_show_all_skills` to access the full skills list.
   - Ensure you scroll through these lists to capture all details.

5. FINALIZATION:
   - Verify all fields in the output schema are populated with REAL data.
   - Provide the final result strictly as JSON.
"""
