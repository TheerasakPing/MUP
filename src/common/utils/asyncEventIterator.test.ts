import { asyncEventIterator, createAsyncEventQueue } from "./asyncEventIterator";

describe("asyncEventIterator", () => {
  it("yields events emitted after subscription", async () => {
    let handler: (value: number) => void = () => { /* noop */ };
    const subscribe = jest.fn((h: (v: number) => void) => {
      handler = h;
    });
    const unsubscribe = jest.fn();

    const iterator = asyncEventIterator<number>(subscribe, unsubscribe);
    const results: number[] = [];

    const iteratorPromise = (async () => {
      for await (const value of iterator) {
        results.push(value);
        if (results.length === 2) break;
      }
    })();

    // Give the iterator a chance to start and call subscribe
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(subscribe).toHaveBeenCalled();

    handler(1);
    handler(2);

    await iteratorPromise;
    expect(results).toEqual([1, 2]);
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("yields initial value if provided", async () => {
    let handler: (value: number) => void = () => { /* noop */ };
    const subscribe = (h: (v: number) => void) => {
      handler = h;
    };
    const unsubscribe = jest.fn();

    const iterator = asyncEventIterator<number>(subscribe, unsubscribe, {
      initialValue: 0,
    });

    const results: number[] = [];
    const nextPromise = (async () => {
      for await (const value of iterator) {
        results.push(value);
        if (results.length === 3) break;
      }
    })();

    // Wait for initial value to be yielded
    await new Promise((resolve) => setTimeout(resolve, 0));

    handler(1);
    handler(2);

    await nextPromise;
    expect(results).toEqual([0, 1, 2]);
  });

  it("handles multiple queued events", async () => {
    let handler: (value: number) => void = () => { /* noop */ };
    const subscribe = jest.fn((h: (v: number) => void) => {
      handler = h;
    });
    const unsubscribe = jest.fn();

    const iterator = asyncEventIterator<number>(subscribe, unsubscribe);
    const results: number[] = [];

    const iteratorPromise = (async () => {
      for await (const value of iterator) {
        results.push(value);
        if (results.length === 3) break;
      }
    })();

    // Give it a chance to start
    await new Promise((resolve) => setTimeout(resolve, 0));

    handler(1);
    handler(2);
    handler(3);

    await iteratorPromise;
    expect(results).toEqual([1, 2, 3]);
  });

  it("calls unsubscribe on cleanup", async () => {
    const unsubscribe = jest.fn();
    const iterator = asyncEventIterator<number>(() => { /* noop */ }, unsubscribe, { initialValue: 1 });

    for await (const _ of iterator) {
      break;
    }

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("does not yield events after being closed", async () => {
    let handler: (value: number) => void = () => { /* noop */ };
    const subscribe = (h: (v: number) => void) => {
      handler = h;
    };
    const unsubscribe = jest.fn();

    const iterator = asyncEventIterator<number>(subscribe, unsubscribe);

    const results: number[] = [];
    const it = iterator[Symbol.asyncIterator]();

    // Start it
    const nextPromise = it.next();
    await new Promise((resolve) => setTimeout(resolve, 0));

    handler(1);
    const first = await nextPromise;
    expect(first.value).toBe(1);
    if (!first.done) {
      results.push(first.value);
    }

    // Close it
    await it.return(undefined);

    handler(2); // Should be ignored because 'ended' is true

    const second = await it.next();
    expect(second.done).toBe(true);

    expect(results).toEqual([1]);
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe("createAsyncEventQueue", () => {
  it("push adds values and iterate yields them", async () => {
    const queue = createAsyncEventQueue<number>();
    const results: number[] = [];

    const iteratePromise = (async () => {
      for await (const value of queue.iterate()) {
        results.push(value);
        if (results.length === 2) break;
      }
    })();

    queue.push(1);
    queue.push(2);

    await iteratePromise;
    expect(results).toEqual([1, 2]);
  });

  it("end terminates the iterator", async () => {
    const queue = createAsyncEventQueue<number>();
    const results: number[] = [];

    const iteratePromise = (async () => {
      for await (const value of queue.iterate()) {
        results.push(value);
      }
    })();

    // Give it a chance to start
    await new Promise((resolve) => setTimeout(resolve, 0));

    queue.push(1);
    // Yield to let the iterator process the pushed value
    await new Promise((resolve) => setTimeout(resolve, 0));

    queue.end();

    await iteratePromise;
    expect(results).toEqual([1]);
  });

  it("handles values pushed before iterate is called", async () => {
    const queue = createAsyncEventQueue<number>();
    queue.push(1);
    queue.push(2);

    const results: number[] = [];
    const iterator = queue.iterate();
    const first = await iterator.next();
    const second = await iterator.next();

    if (!first.done && !second.done) {
      results.push(first.value, second.value);
    }
    expect(results).toEqual([1, 2]);
  });

  it("end wakes up a waiting iterator", async () => {
    const queue = createAsyncEventQueue<number>();
    const results: number[] = [];

    const iteratePromise = (async () => {
      for await (const value of queue.iterate()) {
        results.push(value);
      }
    })();

    // Wait a bit to ensure iterator is waiting
    await new Promise((resolve) => setTimeout(resolve, 10));

    queue.end();
    await iteratePromise;

    expect(results).toEqual([]);
  });

  it("push after end does nothing", async () => {
    const queue = createAsyncEventQueue<number>();
    queue.end();
    queue.push(1);

    const results: number[] = [];
    const iteratePromise = (async () => {
      for await (const value of queue.iterate()) {
        results.push(value);
      }
    })();

    await iteratePromise;
    expect(results).toEqual([]);
  });
});
