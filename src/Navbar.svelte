<script>
  import SearchBar from "./SearchBar.svelte";
  import { createEventDispatcher } from "svelte";
  let dispatch = createEventDispatcher();

  export let filter = {};

  function handleClicked() {
    dispatch("search");
  }
</script>

<div
  class="w-full flex flex-col md:flex-row justify-between items-center px-5
  md:px-20 py-5">
  <a href="/" class="self-start md:mb-0 mb-5">
    <img src="logo.svg" alt="Logo Windbnb" />
  </a>
  <SearchBar
    location={filter.location}
    guest={filter.guest}
    on:clicked={handleClicked} />
</div>
