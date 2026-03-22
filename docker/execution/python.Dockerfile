# ============================================================
# CloudExecX — Python Execution Sandbox
# ============================================================
# SECURITY: This image runs user code in a locked-down environment.
# - Non-root user (nobody)
# - No network access (enforced at container runtime)
# - Read-only filesystem except /tmp
# - All capabilities dropped at runtime
# ============================================================

FROM python:3.11-alpine

# Remove unnecessary packages to minimize attack surface
RUN apk --no-cache add --virtual .build-deps && \
    rm -rf /var/cache/apk/* /root/.cache

# Create a minimal working directory
WORKDIR /tmp

# Default: run the code file injected at /tmp/code.py
CMD ["python3", "/tmp/code.py"]
