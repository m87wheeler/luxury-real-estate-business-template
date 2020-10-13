import { writable } from 'svelte/store';

export const Search = writable({
  area: 'SW1',
  buy: true,
  min: 700000,
  max: 135000,
});
