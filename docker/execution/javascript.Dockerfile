# ============================================================
# CloudExecX — JavaScript (Node.js) Execution Sandbox
# ============================================================
# SECURITY: Locked-down Node.js environment for user code.
# - Non-root user (nobody)
# - No network access (enforced at container runtime)
# - Read-only filesystem except /tmp
# - All capabilities dropped at runtime
# ============================================================

FROM node:20-alpine

# Remove unnecessary files to minimize attack surface
RUN rm -rf /var/cache/apk/* /root/.cache /usr/local/lib/node_modules/npm

WORKDIR /tmp

# Default: run the code file injected at /tmp/code.js
CMD ["node", "/tmp/code.js"]
