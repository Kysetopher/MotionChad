'use client';

import { useEffect, useMemo, useRef } from 'react';

export interface CallOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ControlFunctions<ReturnT> {
  cancel: () => void;
  flush: () => ReturnT | undefined;
  isPending: () => boolean;
}

export interface DebouncedState<T extends (...args: any) => any>
  extends ControlFunctions<ReturnType<T>> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
}

export interface Options extends CallOptions {
  debounceOnServer?: boolean;
  maxWait?: number;
}

export function useDebouncedCallback<T extends (...args: any) => any>(
  func: T,
  wait?: number,
  options?: Options
): DebouncedState<T> {
  const lastCallTime = useRef<number | null>(null);
  const lastInvokeTime = useRef<number>(0);
  const timerId = useRef<any>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);
  const lastThis = useRef<unknown>(null);
  const result = useRef<ReturnType<T> | undefined>(undefined);
  const funcRef = useRef<T>(func);
  const mounted = useRef(true);

  funcRef.current = func;

  const isClientSize = typeof window !== 'undefined';
  const useRAF = !wait && wait !== 0 && isClientSize;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  wait = wait || 0;
  options = options || {};

  const leading = !!options.leading;
  const trailing = 'trailing' in options ? !!options.trailing : true;
  const maxing = 'maxWait' in options;
  const debounceOnServer = !!options.debounceOnServer;
  const maxWait = maxing ? Math.max(options.maxWait ?? 0, wait) : null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const debounced = useMemo(() => {
    const invokeFunc = (time: number) => {
      const args = lastArgs.current!;
      const thisArg = lastThis.current;

      lastArgs.current = lastThis.current = null;
      lastInvokeTime.current = time;

      result.current = funcRef.current.apply(thisArg, args);
      return result.current;
    };

    const startTimer = (pendingFunc: () => void, wait: number) => {
      if (useRAF) cancelAnimationFrame(timerId.current);
      timerId.current = useRAF
        ? requestAnimationFrame(pendingFunc)
        : setTimeout(pendingFunc, wait);
    };

    const shouldInvoke = (time: number) => {
      if (!mounted.current) return false;

      const timeSinceLastCall = time - (lastCallTime.current ?? 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        !lastCallTime.current ||
        timeSinceLastCall >= wait! ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= (maxWait ?? 0))
      );
    };

    const trailingEdge = (time: number) => {
      timerId.current = null;

      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }

      lastArgs.current = lastThis.current = null;
      return result.current;
    };

    const timerExpired = () => {
      const time = Date.now();

      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      if (!mounted.current) return;

      const timeSinceLastCall = time - (lastCallTime.current ?? 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = wait! - timeSinceLastCall;
      const remainingWait = maxing
        ? Math.min(timeWaiting, (maxWait ?? 0) - timeSinceLastInvoke)
        : timeWaiting;

      startTimer(timerExpired, remainingWait);
    };

    const func: DebouncedState<T> = (...args: Parameters<T>) => {
      if (!isClientSize && !debounceOnServer) return undefined;

      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      lastThis.current = this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (!timerId.current && mounted.current) {
          lastInvokeTime.current = time;
          startTimer(timerExpired, wait!);
          return leading ? invokeFunc(time) : result.current;
        }
        if (maxing) {
          startTimer(timerExpired, wait!);
          return invokeFunc(time);
        }
      }

      if (!timerId.current) {
        startTimer(timerExpired, wait!);
      }

      return result.current;
    };

    func.cancel = () => {
      if (timerId.current) {
        useRAF
          ? cancelAnimationFrame(timerId.current)
          : clearTimeout(timerId.current);
      }

      lastInvokeTime.current = 0;
      lastArgs.current =
        lastCallTime.current =
        lastThis.current =
        timerId.current =
          null;
    };

    func.isPending = () => !!timerId.current;

    func.flush = () =>
      timerId.current ? trailingEdge(Date.now()) : result.current;

    return func;
  }, [
    leading,
    trailing,
    maxing,
    wait,
    maxWait,
    useRAF,
    isClientSize,
    debounceOnServer,
  ]);

  return debounced;
}
