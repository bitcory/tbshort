import type { Job } from "./types";

// Next.js dev 모드에서 모듈 재컴파일 시 상태 유지를 위해 globalThis 사용
type Listener = (job: Job) => void;

interface JobStoreState {
  jobs: Map<string, Job>;
  listeners: Map<string, Set<Listener>>;
  pipelineLock: boolean;
}

const globalKey = "__aitoolbee_job_store__";

function getStore(): JobStoreState {
  const g = globalThis as unknown as Record<string, JobStoreState>;
  if (!g[globalKey]) {
    g[globalKey] = {
      jobs: new Map(),
      listeners: new Map(),
      pipelineLock: false,
    };
  }
  return g[globalKey];
}

export function createJob(id: string, type: "tts" | "render"): Job {
  const store = getStore();
  const job: Job = {
    id,
    type,
    status: "pending",
    createdAt: Date.now(),
  };
  store.jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return getStore().jobs.get(id);
}

export function updateJob(
  id: string,
  update: Partial<Pick<Job, "status" | "progress" | "result" | "error">>
): Job | undefined {
  const job = getStore().jobs.get(id);
  if (!job) return undefined;
  Object.assign(job, update);
  return job;
}

export function isPipelineLocked(): boolean {
  return getStore().pipelineLock;
}

export function acquireLock(): boolean {
  const store = getStore();
  if (store.pipelineLock) return false;
  store.pipelineLock = true;
  return true;
}

export function releaseLock(): void {
  getStore().pipelineLock = false;
}

export function subscribe(jobId: string, listener: Listener): () => void {
  const store = getStore();
  if (!store.listeners.has(jobId)) {
    store.listeners.set(jobId, new Set());
  }
  store.listeners.get(jobId)!.add(listener);
  return () => {
    store.listeners.get(jobId)?.delete(listener);
    if (store.listeners.get(jobId)?.size === 0) {
      store.listeners.delete(jobId);
    }
  };
}

export function notifyListeners(jobId: string): void {
  const store = getStore();
  const job = store.jobs.get(jobId);
  if (!job) return;
  store.listeners.get(jobId)?.forEach((fn) => fn(job));
}

export function updateAndNotify(
  id: string,
  update: Partial<Pick<Job, "status" | "progress" | "result" | "error">>
): void {
  updateJob(id, update);
  notifyListeners(id);
}
