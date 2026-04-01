import { db } from '@/lib/db';
import { JobStatus, Job } from '@/types';

/**
 * Type for job handler functions
 */
export type JobHandler<T = any> = (payload: T) => Promise<any>;

/**
 * Job processor configuration
 */
export interface JobProcessorOptions {
  batchSize?: number;
  pollInterval?: number; // milliseconds
  maxConcurrency?: number;
  maxRetries?: number;
}

/**
 * Job queue options
 */
export interface JobOptions {
  priority?: number;
  maxAttempts?: number;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

/**
 * Job Processor for database-backed job queue
 */
export class JobProcessor {
  private handlers: Map<string, JobHandler> = new Map();
  private isRunning: boolean = false;
  private options: Required<JobProcessorOptions>;

  constructor(options: JobProcessorOptions = {}) {
    this.options = {
      batchSize: options.batchSize || 10,
      pollInterval: options.pollInterval || 5000, // 5 seconds
      maxConcurrency: options.maxConcurrency || 5,
      maxRetries: options.maxRetries || 3,
    };
  }

  /**
   * Register a job handler
   */
  registerHandler<T = any>(jobType: string, handler: JobHandler<T>): void {
    this.handlers.set(jobType, handler);
  }

  /**
   * Add a job to the queue
   */
  async addJob<T = any>(
    type: string,
    payload: T,
    options: JobOptions = {}
  ): Promise<string> {
    const job = await db.jobQueue.create({
      data: {
        type,
        payload: payload as any,
        status: JobStatus.PENDING,
        priority: options.priority || 0,
        maxAttempts: options.maxAttempts || this.options.maxRetries,
        scheduledFor: options.scheduledFor || new Date(),
      },
    });

    return job.id;
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    const job = await db.jobQueue.findUnique({
      where: { id: jobId },
    });

    if (!job) return null;

    return {
      id: job.id,
      type: job.type,
      payload: job.payload as Record<string, any>,
      status: job.status as JobStatus,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      scheduledFor: job.scheduledFor,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result as Record<string, any>,
    };
  }

  /**
   * Start processing jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Job processor is already running');
      return;
    }

    this.isRunning = true;
    console.log('Job processor started');

    // eslint-disable-next-line no-constant-condition
    while (this.isRunning) {
      try {
        await this.processBatch();
      } catch (error) {
        console.error('Error processing job batch:', error);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.options.pollInterval));
    }
  }

  /**
   * Stop processing jobs
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('Job processor stopped');
  }

  /**
   * Process a batch of pending jobs
   */
  private async processBatch(): Promise<void> {
    const jobs = await db.jobQueue.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledFor: {
          lte: new Date(),
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: this.options.batchSize,
    });

    if (jobs.length === 0) {
      return;
    }

    // Process up to maxConcurrency jobs in parallel
    const batches = this.chunkArray(jobs, this.options.maxConcurrency);

    for (const batch of batches) {
      await Promise.allSettled(batch.map((job) => this.processJob(job.id)));
    }
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = await db.jobQueue.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      console.warn(`Job ${jobId} not found`);
      return;
    }

    // Mark as processing
    await db.jobQueue.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    try {
      const handler = this.handlers.get(job.type);

      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      const result = await handler(job.payload);

      // Mark as completed
      await db.jobQueue.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          result: result as any,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (job.attempts + 1 < job.maxAttempts) {
        // Retry
        const backoffDelay = Math.min(1000 * Math.pow(2, job.attempts), 3600000); // Max 1 hour

        await db.jobQueue.update({
          where: { id: jobId },
          data: {
            status: JobStatus.RETRY,
            attempts: { increment: 1 },
            error: errorMessage,
            scheduledFor: new Date(Date.now() + backoffDelay),
          },
        });
      } else {
        // Max retries exceeded
        await db.jobQueue.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            completedAt: new Date(),
            attempts: { increment: 1 },
            error: errorMessage,
          },
        });

        console.error(`Job ${jobId} failed after ${job.attempts + 1} attempts:`, errorMessage);
      }
    }
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const stats = await db.jobQueue.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const counts: Record<string, number> = {};
    for (const stat of stats) {
      counts[stat.status] = stat._count.id;
    }

    return {
      pending: counts[JobStatus.PENDING] || 0,
      processing: counts[JobStatus.PROCESSING] || 0,
      completed: counts[JobStatus.COMPLETED] || 0,
      failed: counts[JobStatus.FAILED] || 0,
      total:
        (counts[JobStatus.PENDING] || 0) +
        (counts[JobStatus.PROCESSING] || 0) +
        (counts[JobStatus.COMPLETED] || 0) +
        (counts[JobStatus.FAILED] || 0),
    };
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<void> {
    await db.jobQueue.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PENDING,
        attempts: 0,
        error: null,
        scheduledFor: new Date(),
      },
    });
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await db.jobQueue.findUnique({
      where: { id: jobId },
    });

    if (job && job.status === JobStatus.PENDING) {
      await db.jobQueue.delete({
        where: { id: jobId },
      });
    }
  }

  /**
   * Clear completed jobs older than a certain date
   */
  async clearOldJobs(beforeDate: Date): Promise<number> {
    const result = await db.jobQueue.deleteMany({
      where: {
        status: JobStatus.COMPLETED,
        completedAt: {
          lt: beforeDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Singleton instance of the job processor
 */
export const jobProcessor = new JobProcessor();

export default jobProcessor;
