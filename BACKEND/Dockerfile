# =========================
# 1️⃣ Builder Stage
# =========================
# base image extraction
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder  

WORKDIR /app

# Disable bytecode compilation to prevent timeouts on large files (like pymupdf)
ENV UV_COMPILE_BYTECODE=0
ENV UV_LINK_MODE=copy

# Set Playwright browsers path to ensure they are installed inside /app
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcurl4 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies (frozen)
RUN uv sync --frozen --no-install-project --no-dev

# Install Playwright browser
RUN uv run --no-sync playwright install chromium

# Copy full source
COPY . .

# Install the project
RUN uv sync --frozen --no-dev


# =========================
# 2️⃣ Runtime Stage
# =========================
# Use the same base to ensure python paths match exactly
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS runtime

WORKDIR /app

# Ensure Playwright looks for browsers in the correct location
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright

# Install ONLY runtime libs required by chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcurl4 \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire app including the .venv from builder
COPY --from=builder /app /app

# Place executables in /app/.venv/bin/ on the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port
EXPOSE 3003

# Run the application using 'python -m' to avoid shebang path issues
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3003"]
