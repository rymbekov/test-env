(function () {
  const Queue = function (params) {
    const defaultParams = {
      types: {
        CONSEQUENTIALLY: 'consequentially',
        POOL: 'pool',
      },
    };

    const list = [];
    let active = false;
    const delay = 1000;
    let runnedTasks = 0;
    const type = params.type || defaultParams.types.CONSEQUENTIALLY;
    const simultaneously = params.simultaneously || 1;

    const runTask = () => {
      try {
        const quItem = list.shift();
        if (type === defaultParams.types.CONSEQUENTIALLY) {
          setTimeout(quItem.task.bind(this, next.bind(this)), delay);
        } else if (type === defaultParams.types.POOL) {
          quItem.task(next);
        }

        runnedTasks++;
        // console.log('runnedTasks = ', runnedTasks);
      } catch (e) {
        next();
        console.warn(e);
      }
    };

    const next = () => {
      runnedTasks--;

      if (!list.length) {
        active = false;
        return active;
      }

      runTask();
    };

    const startConsequentiallyProcessing = () => {
      if (active) {
        return;
      }

      if (!list.length) {
        return;
      }

      active = true;

      runTask();
    };

    const addTask = (task) => {
      list.push(task);
      if (type === defaultParams.types.CONSEQUENTIALLY) {
        startConsequentiallyProcessing();
      } else if (type === defaultParams.types.POOL) {
        startPoolProcessing();
      }
    };

    const startPoolProcessing = () => {
      if (runnedTasks === simultaneously) {
        return false;
      }

      if (!list.length) {
        active = false;
        return;
      }

      active = true;

      runTask();
    };

    const reset = () => {
      list.length = 0;
      active = false;
      runnedTasks = 0;
    };

    return {
      addTask,
      reset,
    };
  };

  const ret = {
    getConsequentiallyTaskRunner() {
      return new Queue({ type: 'consequentially' });
    },
    getPoolTaskRunner(params) {
      return new Queue({ type: 'pool', simultaneously: params.simultaneously || 1 });
    },
  };

  if (typeof define === 'function' && define.amd)
    define(function () {
      return ret;
    });
  else return (this.ret = ret);
})();
