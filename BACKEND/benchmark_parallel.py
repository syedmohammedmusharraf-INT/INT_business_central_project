import os
import asyncio
import time
from dotenv import load_dotenv
from app.services.structured_service_result import infer_service_alignment

async def benchmark():
    load_dotenv(r'c:\Users\Navvidha_Bharech\Desktop\INT Business Central Project\BACKEND\.env')
    
    summary = {
        "intent": "Modernization", "capabilities": "Cloud", "technologies": "Java", "problems": "Legacy", "industry": "Insurance"
    }
    
    service_data = {
        "service": "Test Service", "intent": "Test", "capabilities": "Test", "problems": "Test", "technologies": "Test", "identity": "Test"
    }

    print("Running 5 parallel inference calls...")
    start_time = time.time()
    tasks = [infer_service_alignment(summary, service_data) for _ in range(5)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    end_time = time.time()
    
    print(f"Total time for 5 parallel calls: {end_time - start_time:.2f} seconds")
    for i, res in enumerate(results):
        print(f"Result {i+1} status: {'Success' if not isinstance(res, Exception) else 'Failed'}")

if __name__ == "__main__":
    asyncio.run(benchmark())
