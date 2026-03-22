# ============================================================
# CloudExecX — C++ Execution Sandbox
# ============================================================
# SECURITY: GCC compilation + execution environment.
# - Non-root user (nobody)
# - No network access (enforced at container runtime)
# - Read-only filesystem except /tmp
# - All capabilities dropped at runtime
#
# Two-step process:
# 1. Compile: g++ -o /tmp/code /tmp/code.cpp
# 2. Execute: /tmp/code
# ============================================================

FROM gcc:13-bookworm

# Clean up unnecessary files
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

# Compile and run — the entrypoint script handles both steps
CMD ["sh", "-c", "g++ -o /tmp/code /tmp/code.cpp -std=c++17 2>&1 && /tmp/code"]
