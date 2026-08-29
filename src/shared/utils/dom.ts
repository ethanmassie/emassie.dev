/**
 * Adds an event listener to target which removes itself after one emission.
 * @param target html element target
 * @param eventName name of the event
 * @param fn logic of the event listener
 * @returns a function to remove the event listener manually
 */
export function oneEvent(
  target: HTMLElement,
  eventName: keyof HTMLElementEventMap | string,
  fn: (e: Event) => void,
): () => void {
  const removeListener = () => {
    target.removeEventListener(eventName, wrapperFn);
  };

  const wrapperFn = (e: Event) => {
    removeListener();
    fn(e);
  };

  target.addEventListener(eventName, wrapperFn);

  return removeListener;
}
