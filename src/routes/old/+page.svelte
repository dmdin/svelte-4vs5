<script lang="ts">
  import Counter from "./Counter.svelte";


  let count = 5
  let count2 = 6
  $: console.log('Parent count', count)
</script>


<div class="flex w-full h-full justify-center items-center">
  <div>
    <h1 class="font-bold">Old</h1>

    <p>Parent: {count}</p>
    <Counter bind:count/>
    <hr>
    <Counter bind:count={count2}/>
  </div>

</div>
