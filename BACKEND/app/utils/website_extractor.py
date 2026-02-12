import asyncio
import sys
import os
from pathlib import Path
from browser_use import Agent, ChatOpenAI
from ..prompts.Website_TaskPrompt import Task
from ..models.website_extract_output import website_content
from .LinkedinTools import tools
from dotenv import load_dotenv


load_dotenv()

# ------------------------------------------------------------------------------------
# ------- BROWSER USE AUTOMATION TOOL TO FETCH COMPANY WEBSITE DETAILS --------------
# ------------------------------------------------------------------------------------
async def extract_website_content(website_url: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found")

    llm = ChatOpenAI(
        api_key=api_key,
        model="gpt-4o",
    )

    # Inject dynamic URL into Task
    dynamic_task = Task.format(website_url)

    agent = Agent(
        task=dynamic_task,
        llm=llm,
        output_model_schema = website_content,
        tools=tools
    )

    history = await agent.run()
    result = history.final_result()
    
    if result:
        return website_content.model_validate_json(result)
    return None

# ----------------------------------------------------------------------------
# Synchronous wrapper that runs extract_linkedin_profile in a new event loop.
# Crucial for Windows compatibility (ProactorEventLoop). ---------------------
# ----------------------------------------------------------------------------
def run_extract_website_content(website_url: str):
    
    def _run():
        if sys.platform == "win32":
            loop = asyncio.WindowsProactorEventLoopPolicy().new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(extract_website_content(website_url))
            finally:
                loop.close()
        else:
            return asyncio.run(extract_linkedin_profile(linkedin_url))

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor() as executor:
        # Note: We don't use loop.run_in_executor here because this IS the entry point
        # to the specialized thread.
        import concurrent.futures
        future = executor.submit(_run)
        return future.result()

async def async_run_extract_website_content(website_url: str):
    """
    Asynchronous version of the wrapper.
    """
    loop = asyncio.get_running_loop()
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor() as executor:
        return await loop.run_in_executor(executor, run_extract_website_content, website_url)

if __name__ == "__main__":
    # Test run
    test_url = "https://intglobal.com/"
    asyncio.run(extract_website_content(test_url))
