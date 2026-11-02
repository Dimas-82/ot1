import { useSyncExternalStore } from 'react';
import { store } from '../store';

export function useStore() {
  const data = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getData()
  );
  return { data, store };
}
