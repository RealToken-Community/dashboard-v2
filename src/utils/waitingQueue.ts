interface WaitingQueueItem<Resolved> {
  resolve: (payload: Resolved) => void
  reject: (payload: unknown) => void
}

export class WaitingQueue<Resolved = void> {
  private queue: WaitingQueueItem<Resolved>[] = []

  get isWaiting() {
    return this.queue.length > 0
  }

  async wait() {
    return new Promise<Resolved>((resolve, reject) => {
      this.queue.push({ resolve, reject })
    })
  }

  resolve(payload: Resolved) {
    this.queue.map(({ resolve }) => resolve(payload))
    this.queue = []
  }

  reject(payload: unknown) {
    this.queue.map(({ reject }) => reject(payload))
    this.queue = []
  }
}
