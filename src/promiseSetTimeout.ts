export const promiseSetTimeout = (duration: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, duration))
}
