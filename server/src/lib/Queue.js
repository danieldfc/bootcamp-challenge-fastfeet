import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import CanceledDeliveryProblemMail from '../app/jobs/CanceledDeliveryProblemMail';
import OrderRegisteredMail from '../app/jobs/OrderRegisteredMail';

const jobs = [CanceledDeliveryProblemMail, OrderRegisteredMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failure', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.name.error} FAILED`, err);
  }
}

export default new Queue();
