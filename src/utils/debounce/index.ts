export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        //@ts-ignore
        func.apply(this, args);
      }, delay);
    };
  }

export default debounce;