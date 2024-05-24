<script lang="ts">
  import {Counter} from './controller'

  export let count: number

  const controller = new Counter(count)

  const count_ = controller.count

  count_.subscribe(v => count = v)

  $: console.log('outer count', count)
  $: console.log('inner count', $count_)
</script>

<p>Outer: {count}</p>
<p>Inner: {$count_}</p>
<button class="btn btn-primary" on:click={() => controller.plus()}>+</button>
<button class="btn btn-primary" on:click={() => controller.minus()}>-</button>