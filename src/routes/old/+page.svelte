<script lang="ts">
  import OldCounter from "$lib/oldCounter/OldCounter.svelte";


  let count = 5
  let count2 = 6
  $: console.log('Parent count', count)
</script>


<div class="flex w-full h-full justify-center items-center">
  <div>
    <h1 class="font-bold">Old</h1>

    <p>Parent: {count}</p>
    <OldCounter bind:count/>
    <hr>
    <OldCounter bind:count={count2}/>
  </div>

</div>
