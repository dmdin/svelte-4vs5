<script lang="ts">
  import {Counter} from './controller.svelte'
  let {count = $bindable(4)}: {count: number} = $props()

  const self = new Counter(count)

  $effect(() => {
    count = self.count
  })

  $inspect('Inner count', self.count)
  $inspect('Outer count', count)
</script>

<div class="">
  <p>inner: {self.count}</p>
  <p>outer: {count}</p>
  <button class="btn btn-primary" onclick={() => self.plus()}>+</button>
  <button class="btn btn-primary" onclick={() => self.minus()}>-</button>
  <!-- <button class="btn btn-primary" onclick={() => count++}>+</button> -->
  <!-- <button class="btn btn-primary" onclick={() => count--}>-</button> -->
</div> 