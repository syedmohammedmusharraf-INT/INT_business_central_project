import asyncio
from browser_use import Agent, Browser, ChatOpenAI 
from BACKEND.app.prompts.Linkedin_TaskPrompt import Task
import json
from BACKEND.app.models.linkedin_extract_output import content
from BACKEND.app.utils.LinkedinTools import tools
from dotenv import load_dotenv
import os
os.environ["ANONYMIZED_TELEMETRY"] = "false"
from pathlib import Path

# Action 'extract' failed with error: Error executing action extract: 'charmap' codec can't encode character '\U0001f64f' in position 1997: character maps to <undefined>

import sys
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")



load_dotenv()
api_key= os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o",
        )

sensitive_data = {'x_user': 'syedmdmusharraf@gmail.com', 'x_pass': 'Musharraf@20045'}


async def main():
        test_url = "https://www.linkedin.com/in/kunalshah1/"
        agent = Agent(
            task=Task.format(linkedin_url=test_url),
            sensitive_data = sensitive_data,
            use_vision=True,
            llm=llm,
            output_model_schema=content,
            tools=tools,
            )
        
        history = await agent.run()
        result = history.final_result()
        if result:
            parsed: content = content.model_validate_json(result)

            # choose file path
            output_path = Path("linkedin_profile_output.json")

            # convert pydantic model → dict
            data = parsed.model_dump()

            # write to json file
            with output_path.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    asyncio.run(main())