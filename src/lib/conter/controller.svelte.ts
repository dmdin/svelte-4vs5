export class Counter {
	count = $state(0);

	constructor(count: number) {
		this.count = count;
	}

	plus() {
		this.count += 1;
		console.log('plus', this.count);
	}
	minus() {
		this.count -= 1;
		console.log('minus', this.count);
	}
}
