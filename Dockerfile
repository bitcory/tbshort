# ============================================
# aitoolbee-shorts Docker Image
# Node.js + Python + ffmpeg
# ============================================

FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Remotion needs Chromium
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

# ============================================
# Install Python dependencies
# ============================================
RUN python3 -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
RUN pip install --no-cache-dir edge-tts

# ============================================
# Install root Node.js dependencies (Remotion)
# ============================================
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ============================================
# Install web dependencies
# ============================================
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci

# ============================================
# Copy source code
# ============================================
COPY src/ ./src/
COPY tsconfig.json ./
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY prompts/ ./prompts/
COPY web/ ./web/

# ============================================
# Setup fonts (empty dir, add fonts at runtime or build)
# ============================================
RUN mkdir -p /app/fonts \
    && rm -f /app/public/fonts /app/web/public/fonts \
    && ln -sf /app/fonts /app/public/fonts \
    && ln -sf /app/fonts /app/web/public/fonts

# ============================================
# Build Next.js
# ============================================
RUN cd web && npm run build

# ============================================
# Create output directories
# ============================================
RUN mkdir -p /app/output/audio /app/output/images /app/public/audio /app/public/images

# ============================================
# Runtime
# ============================================
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/web
CMD ["npx", "next", "start", "-p", "3000"]
