export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): T & { cancel: () => void } => {
  // biome-ignore lint/style/noParameterAssign: checked
  if (wait < 0) wait = 0

  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let result: ReturnType<T>
  let lastCallTime: number | null = null

  const { leading = false, trailing = true } = options

  const invokeFunc = (time: number) => {
    // biome-ignore lint/style/noNonNullAssertion: checked
    const args = lastArgs!
    const thisArg = lastThis

    lastArgs = lastThis = null
    lastCallTime = time
    result = func.apply(thisArg, args)
    return result
  }

  const leadingEdge = (time: number) => {
    lastCallTime = time
    timeout = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime as number)
    return Math.max(0, wait - timeSinceLastCall)
  }

  const shouldInvoke = (time: number) => {
    if (lastCallTime === null) return true
    const timeSinceLastCall = time - lastCallTime
    return timeSinceLastCall >= wait
  }

  const timerExpired = () => {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeout = setTimeout(timerExpired, remainingWait(time))
  }

  const trailingEdge = (time: number) => {
    timeout = null
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = null
    return result
  }

  function debounced(this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this

    if (isInvoking) {
      if (timeout === null) {
        return leadingEdge(time)
      }
      if (leading) {
        timeout = setTimeout(timerExpired, wait)
        return invokeFunc(time)
      }
    }
    if (timeout === null) {
      timeout = setTimeout(timerExpired, wait)
    }
    return result
  }

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    lastCallTime = null
    timeout = null
    lastArgs = null
    lastThis = null
  }

  return debounced as T & { cancel: () => void }
}
