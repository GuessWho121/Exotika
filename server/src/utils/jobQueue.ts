import { logger } from "./logger.js"

interface Job {
  name: string
  fn: () => Promise<void>
  retries: number
  maxRetries: number
  delayMs: number
}

const queue: Job[] = []
let processing = false

const processQueue = async () => {
  if (processing || queue.length === 0) return
  processing = true

  while (queue.length > 0) {
    const job = queue.shift()
    if (!job) continue

    try {
      logger.info(`[Job Queue] Running job: ${job.name} (Attempt ${job.retries + 1}/${job.maxRetries})`)
      await job.fn()
      logger.info(`[Job Queue] Job succeeded: ${job.name}`)
    } catch (err: any) {
      job.retries += 1
      logger.error(`[Job Queue] Job failed: ${job.name}. Error: ${err?.message || err}`)

      if (job.retries < job.maxRetries) {
        const nextDelay = job.delayMs * Math.pow(2, job.retries - 1)
        logger.info(`[Job Queue] Re-queuing ${job.name} in ${nextDelay}ms`)
        setTimeout(() => {
          queue.push(job)
          processQueue()
        }, nextDelay)
      } else {
        logger.error(`[Job Queue] Job exhausted all retries: ${job.name}`)
      }
    }
  }

  processing = false
}

export const enqueueJob = (name: string, fn: () => Promise<void>, maxRetries = 5, initialDelayMs = 5000) => {
  queue.push({
    name,
    fn,
    retries: 0,
    maxRetries,
    delayMs: initialDelayMs
  })
  processQueue().catch(err => logger.error(`[Job Queue] Error processing queue:`, err))
}
