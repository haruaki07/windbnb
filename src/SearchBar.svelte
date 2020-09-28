<script>
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher();
  export let location = {};
  export let guest = 0;

  function handleClick() {
    dispatch("clicked");
  }

  $: { location, guest };
</script>

<style type="text/postcss">
  .empty {
    @apply text-gray-400 select-none;
  }
</style>

<div
  class="flex items-center rounded-large shadow text-sm cursor-pointer divide-x divide-gray-300"
  on:click={handleClick}>
  <div
    class="p-3 px-4 {location.city && location.country ? 'filled' : 'empty'}">
    {location.city && location.country ? `${location.city},${location.country}` : 'Add location'}
  </div>
  <div
    class="p-3 px-4 {guest ? 'filled' : 'empty'}">
    {guest ? `${guest} guests` : 'Add guest'}
  </div>
  <button class="p-3 px-4 text-red-500 focus:outline-none">
    <span class="material-icons align-middle">search</span>
  </button>
</div>
