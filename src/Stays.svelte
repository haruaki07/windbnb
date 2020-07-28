<script>
  import Stay from "./Stay.svelte";

  export let stays = {};
</script>

<div class="p-5 md:px-20">
  <div class="flex justify-between items-center pb-6">
    <h1 class="text-2xl font-bold">Stays in Finland</h1>
    <p>{stays.length} Stays</p>
  </div>
    {#if stays.length} 
      <div class="w-full grid gap-8 grid-cols-1 md:grid-cols-3 sm:grid-cols-2">
        {#each stays as stay}
          <Stay detail={stay} />
        {/each}
      </div>
    {:else}
      <p class="text-center w-full">Stays couldn't be found.</p>
    {/if}
</div>
