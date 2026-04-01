// ============================================================
// CloudExecX — Docker Container Manager
// ============================================================
// Handles the full lifecycle of execution containers:
// 1. Create container with security restrictions
// 2. Inject user code as a file
// 3. Start container and collect output
// 4. Enforce timeout (5 seconds)
// 5. Destroy container after execution
//
// SECURITY CRITICAL: All restrictions are enforced here.
// ============================================================

import Docker from 'dockerode';
import { Readable } from 'stream';

// Initialize Dockerode with OS-specific socket path
const isWindows = process.platform === 'win32';
const docker = new Docker({ 
  socketPath: isWindows ? '//./pipe/docker_engine' : '/var/run/docker.sock' 
});

/** Docker image names corresponding to each language */
const LANGUAGE_IMAGES: Record<string, string> = {
  python: 'cloudexecx-python',
  javascript: 'cloudexecx-javascript',
  cpp: 'cloudexecx-cpp',
};

/** File extension for each language */
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: '.py',
  javascript: '.js',
  cpp: '.cpp',
};

export interface DockerExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

/**
 * Execute user code in an isolated Docker container.
 *
 * Security measures applied:
 * - Network disabled (--network none)
 * - Memory hard limit: 128MB
 * - CPU limit: 50% of one core
 * - Read-only root filesystem (only /tmp writable)
 * - Run as non-root user (nobody, UID 65534)
 * - All Linux capabilities dropped
 * - No new privileges
 * - 5-second timeout with forced kill
 */
export async function executeInDocker(
  language: string,
  code: string
): Promise<DockerExecutionResult> {
  const image = LANGUAGE_IMAGES[language];
  const ext = LANGUAGE_EXTENSIONS[language];

  if (!image || !ext) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const containerName = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let container: Docker.Container | null = null;

  try {
    // SECURITY: This is where all isolation is configured.
    container = await docker.createContainer({
      Image: image,
      name: containerName,
      
      // Inject code as a command that writes to /tmp then executes
      Cmd: language === 'cpp'
        ? ['sh', '-c', `cat > /tmp/code${ext} << 'CLOUDEXECX_EOF'\n${code}\nCLOUDEXECX_EOF\ng++ -o /tmp/code /tmp/code.cpp -std=c++17 2>&1 && /tmp/code`]
        : ['sh', '-c', `cat > /tmp/code${ext} << 'CLOUDEXECX_EOF'\n${code}\nCLOUDEXECX_EOF\n${language === 'python' ? 'python3' : 'node'} /tmp/code${ext}`],

      // Disable network — user code cannot make HTTP calls
      NetworkDisabled: true,

      HostConfig: {
        // MEMORY: Hard 128MB limit. Container is OOM-killed if exceeded.
        Memory: 128 * 1024 * 1024,          // 128MB
        MemorySwap: 128 * 1024 * 1024,       // No swap (same as memory = swap disabled)

        // CPU: Limit to 50% of one core
        NanoCpus: 500_000_000,               // 0.5 CPUs in nanoseconds

        // FILESYSTEM: Read-only root. Only /tmp is writable.
        ReadonlyRootfs: true,
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=64m',
        },

        // CAPABILITIES: Drop ALL Linux capabilities.
        // This prevents privilege escalation, raw socket creation, etc.
        CapDrop: ['ALL'],

        // Prevent gaining new privileges via setuid/setgid binaries
        SecurityOpt: ['no-new-privileges'],

        // PROCESS LIMITS: Max 64 processes to prevent fork bombs
        PidsLimit: 64,

        // AUTO REMOVE: Container is deleted after it stops
        AutoRemove: true,
      },

      // USER: Run as nobody (UID 65534) — non-root
      User: '65534:65534',

      // Working directory
      WorkingDir: '/tmp',

      // Disable stdin, enable stdout/stderr capture
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: false,
      Tty: false,
    });

    const startTime = Date.now();
    
    // Attach to streams before starting
    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    let stdout = '';
    let stderr = '';
    // Demultiplex Docker stream into stdout/stderr
    const { PassThrough } = require('stream');
    const stdoutStream = new PassThrough();
    const stderrStream = new PassThrough();

    docker.modem.demuxStream(stream, stdoutStream, stderrStream);

    stdoutStream.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });

    stderrStream.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });

    // Start the container
    await container.start();

    // Race between container completion and 5-second timeout
    let timedOut = false;
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        timedOut = true;
        try {
          // Force-kill the container if it exceeds timeout
          await container!.kill().catch(() => {});
        } catch {
          // Container may have already exited
        }
        resolve();
      }, 5000); // 5-second hard limit
    });

    const waitPromise = container.wait();

    const result = await Promise.race([
      waitPromise,
      timeoutPromise.then(() => ({ StatusCode: 137 })),
    ]) as { StatusCode: number };

    const executionTimeMs = Date.now() - startTime;

    // Give streams a moment to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    const maxOutputLen = 10_000;
    if (stdout.length > maxOutputLen) {
      stdout = stdout.slice(0, maxOutputLen) + '\n... [output truncated]';
    }
    if (stderr.length > maxOutputLen) {
      stderr = stderr.slice(0, maxOutputLen) + '\n... [output truncated]';
    }

    return {
      stdout: stdout.trim(),
      stderr: timedOut
        ? (stderr.trim() + '\n⏱️ Execution timed out (5s limit)').trim()
        : stderr.trim(),
      exitCode: result.StatusCode,
      executionTimeMs,
      timedOut,
    };
  } catch (error: any) {
    // Ensure container is removed even if execution fails
    if (container) {
      try {
        await container.kill().catch(() => {});
        await container.remove({ force: true }).catch(() => {});
      } catch {
        // Best-effort cleanup
      }
    }

    return {
      stdout: '',
      stderr: `Execution error: ${error.message || 'Unknown error'}`,
      exitCode: 1,
      executionTimeMs: 0,
      timedOut: false,
    };
  }
}
