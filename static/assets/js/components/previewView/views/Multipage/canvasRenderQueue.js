class RenderQueue {
  queue = [];

  isStarted = false;

  constructor(numberParallelJobs) {
    this.numberParallelJobs = numberParallelJobs;
  }

  append(job) {
    this.queue.push(job);
    if (!this.isStarted) this.start();
  }

  async start() {
    const jobs = this.queue.splice(0, this.numberParallelJobs);
    if (jobs.length > 0) {
      this.isStarted = true;
      await Promise.all(jobs.map((job) => job()));
      this.start();
    } else {
      this.isStarted = false;
    }
  }
}

export default new RenderQueue(5);
