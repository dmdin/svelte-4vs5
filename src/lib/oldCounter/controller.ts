import { writable } from 'svelte/store';

export class Counter {
	count = writable(0);

	constructor(init: number) {
    this.count.set(init);
	}

	plus() {
		this.count.update((v) => {
      console.log('plus', v + 1);
      return v + 1
    });
	}

	minus() {
		this.count.update((v) => {
      console.log('minus', v - 1)
      return v - 1}
    );
    
	}
}
