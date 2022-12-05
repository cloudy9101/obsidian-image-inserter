export function debounce(fn: (query: string) => Promise<void>, delay: number): (query: string) => void {
  let timer: ReturnType<typeof setTimeout>;

  return function (...params) {
    const args = params
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function validUrl(url: string) {
  try { 
    return Boolean(new URL(url)); 
  } catch(e){ 
    return false; 
  }
}
