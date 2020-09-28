<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  let dispatch = createEventDispatcher();

  export let visible = false;
  export let locationList = [];

  let location = { city: "", country: "" };
  let guest = "";
  let adults = 0;
  let children = 0;
  let overlay = false;
  let toggleTab = "location";

  function toggleVisible() {
    visible = !visible;
    toggleTab = "location";
    dispatch("close", visible);
  }

  function handleSearch() {
    visible = false;
    toggleTab = "location";
    dispatch("search", { location, guest });
  }

  function clearLocation() {
    location.city = location.country = "";
  }

  function clearGuest() {
    adults = children = 0;
  }

  $: {
    overlay = visible;
    if (adults <= 0) adults = 0;
    if (children <= 0) children = 0;
    guest = adults + children;
  }
</script>

<style type="text/postcss">
  .hidelist {
    @apply invisible opacity-0;
  }
  .showlist {
    @apply visible opacity-100;
  }
  .filled {
    @apply cursor-pointer;
  }
  .empty {
    @apply text-gray-400 select-none cursor-text;
  }
  .input-label {
    top: 8px;
    left: 25px;
    @apply m-0 text-black font-semibold uppercase absolute;
  }
  .clear-input {
    top: 18px;
    right: 25px;
    @apply m-0 text-black font-semibold uppercase absolute;
  }
  .form-input {
    padding-top: 18px;
    padding-left: 24px;
    outline: none;
    @apply text-xs absolute inset-x-0 inset-y-0 w-full border border-transparent cursor-pointer;
  }
  .error {
    @apply border border-red-500;
  }
  .focus {
    outline: none;
    @apply border border-black;
  }
</style>

{#if visible}
  <div class="fixed top-0 left-0 w-full h-screen">
    <div class="bg-white p-5 md:px-20 md:py-16">
      <div class="md:hidden block mb-5 text-sm flex justify-between items-center">
        Edit your search
        <i class="material-icons cursor-pointer" on:click={toggleVisible}>close</i>
      </div>
      <div class="grid md:grid-cols-3 grid-cols-1 rounded-large shadow divide-y md:divide-y-0 md:divide-x divide-gray-300">
        <div class="relative w-full h-12 md:h-auto">
          <input
            type="text"
            class="form-input rounded-large"
            class:focus={toggleTab === "location"}
            class:filled={location !== ''}
            class:empty={location === ''}
            readonly
            on:click={() => (toggleTab = "location")}
            placeholder="Add location"
            value={location.city ? `${location.city}, ${location.country}` : ''} />
          <span class="input-label text-smallest">Location</span>
          {#if location.city && location.country}
            <span class="clear-input text-smallest" on:click={clearLocation}><i class="material-icons" style="font-size: 12px">close</i></span>
          {/if}
        </div>
        <div class="relative w-full h-12 md:h-auto">
          <input
            type="text"
            class="empty form-input rounded-large"
            class:focus={toggleTab === "guest"}
            class:filled={guest !== ''}
            class:empty={guest === ''}
            readonly
            on:click={() => (toggleTab = "guest")}
            placeholder="Add guest"
            value={guest} />
          <span class="input-label text-smallest">Guest</span>
          {#if guest}
            <span class="clear-input text-smallest" on:click={clearGuest}><i class="material-icons" style="font-size: 12px">close</i></span>
          {/if}
        </div>
        <div class="py-1 px-6 text-center md:block hidden">
          <button
            on:click={handleSearch}
            class="bg-red-500 hover:bg-red-700 text-white text-sm font-medium
            py-2 px-4 rounded-large">
            <span class="material-icons align-middle mr-1">search</span>
            <span class="align-middle">Search</span>
          </button>
        </div>
      </div>
      <div class="grid md:grid-cols-3 grid-cols-1 relative">
        <div
          class="md:pt-10 pt-5 px-1 transition duration-200 w-full"
          class:hidelist={toggleTab !== "location"}
          class:showlist={toggleTab === "location"}>
          {#each locationList as loc}
            <div
              on:click={() => {
                location = { ...loc };
                toggleTab = "";
              }}
              class="text-gray-800 flex items-center cursor-pointer p-4
              hover:bg-gray-400 text-xs font-medium">
              <span class="material-icons mr-2">room</span>
              {loc.city}, {loc.country}
            </div>
          {/each}
        </div>
        <div
          class="md:pt-10 pt-3 px-1 transition duration-500 md:static absolute w-full"
          class:hidelist={toggleTab !== "guest"}
          class:showlist={toggleTab === "guest"}>
          <div class="flex flex-col p-4">
            <div>
              <h1 class="font-bold text-sm">Adults</h1>
              <p class="text-sm" style="color: rgb(189, 189, 189);">
                Ages 13 or older
              </p>
              <div class="flex items-center mt-2">
                <button
                  on:click={() => adults--}
                  class="border border-black rounded bg-white text-black w-5 h-5
                  leading-4 active:bg-gray-400">
                  <span
                    class="material-icons align-middle"
                    style="font-size:12px">
                    remove
                  </span>
                </button>
                <div
                  class="w-12 h-5 leading-5 text-center text-xs font-bold"
                  contenteditable="true"
                  onkeydown="if(event.metaKey) return true; return false;"
                  bind:innerHTML={adults} />
                <button
                  on:click={() => adults++}
                  class="border border-black rounded bg-white text-black w-5 h-5
                  leading-4 active:bg-gray-400">
                  <span
                    class="material-icons align-middle"
                    style="font-size:12px">
                    add
                  </span>
                </button>
              </div>
            </div>
            <div class="mt-10">
              <h1 class="font-bold text-sm">Children</h1>
              <p class="text-sm" style="color: rgb(189, 189, 189);">
                Ages 2-12
              </p>
              <div class="flex items-center mt-2">
                <button
                  on:click={() => children--}
                  class="border border-black rounded bg-white text-black w-5 h-5
                  leading-4 active:bg-gray-400">
                  <span
                    class="material-icons align-middle"
                    style="font-size:12px">
                    remove
                  </span>
                </button>
                <div
                  class="w-12 h-5 leading-5 text-center text-xs font-bold"
                  contenteditable="true"
                  onkeydown="if(event.metaKey) return true; return false;"
                  bind:innerHTML={children} />
                <button
                  on:click={() => children++}
                  class="border border-black rounded bg-white text-black w-5 h-5
                  leading-4 active:bg-gray-400">
                  <span
                    class="material-icons align-middle"
                    style="font-size:12px">
                    add
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md:hidden block mt-16 text-center">
      	<button
            on:click={handleSearch}
            class="bg-red-500 hover:bg-red-700 text-white text-sm font-medium
            py-2 px-4 rounded-large">
            <span class="material-icons align-middle mr-1">search</span>
            <span class="align-middle">Search</span>
          </button>
      </div>
    </div>
    {#if overlay}
      <div
        on:click={toggleVisible}
        transition:fade={{ duration: 150 }}
        class="absolute w-full h-screen opacity-25 bg-black" />
    {/if}
  </div>
{/if}
