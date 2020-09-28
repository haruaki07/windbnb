<script>
  import Tailwindcss from './styles/Tailwindcss.svelte';
  import Navbar from "./Navbar.svelte";
  import Footer from "./Footer.svelte";
  import Stays from "./Stays.svelte";
  import SearchNav from "./SearchNav.svelte";
  import stays from "./stays.js";
  import { uniqId } from './helper/uniqId'; 

  let nav = false;
  let filter = {};
  let staysCopy = stays.map((obj) => Object.assign( obj, { id: uniqId() }));
  let locationList = staysCopy.filter(
    (item, i, self) => self.map(itm => itm.city).indexOf(item.city) === i
  );

  function handleSearch(e) {
    let fil = e.detail;
    filter = {...fil};
    staysCopy = stays.filter(stay => {
      return fil.location.city && fil.location.country
        ? stay.city == fil.location.city &&
            stay.country == fil.location.country &&
            stay.maxGuests >= fil.guest
        : true;
    });
  }

  function toggleSearchNav() {
    nav = !nav;
  }

  function closeSearchNav(e) {
    nav = e.detail;
  }
  console.log(stays);
</script>

<Navbar on:search={toggleSearchNav} {filter} />
<Stays stays={staysCopy} />
<SearchNav
  visible={nav}
  on:close={closeSearchNav}
  {locationList}
  on:search={handleSearch} />
<Footer />
