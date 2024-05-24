<script lang="ts">
  import Counter from "./Counter.svelte";
  // import OldCounter from "$lib/oldCounter/OldCounter.svelte";
  let count = $state(6)
  let count2 = $state(7)

  $inspect('Parent count', count)
</script>


<div class="flex w-full h-full justify-center items-center">
  <div>
    <h1 class="font-bold">New</h1>
    <p>Parent: {count}</p>
    <Counter bind:count/>
    <hr>
    <Counter bind:count={count2}/>
  </div>
</div>
