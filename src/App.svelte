<script>
  import Navbar from "./Navbar.svelte";
  import Footer from "./Footer.svelte";
  import Stays from "./Stays.svelte";
  import SearchNav from "./SearchNav.svelte";
  import stays from "./stays.js";

  let nav = false;
  let filter = {};
  let staysCopy = [...stays];
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
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @font-face {
    font-family: 'Montserrat';
    font-style: normal;
    font-weight: 400;
    src: url('../fonts/montserrat-v14-latin-regular.eot');
    src: local('Montserrat Regular'), local('Montserrat-Regular'),
         url('../fonts/montserrat-v14-latin-regular.eot?#iefix') format('embedded-opentype'),
         url('../fonts/montserrat-v14-latin-regular.woff2') format('woff2'),
         url('../fonts/montserrat-v14-latin-regular.woff') format('woff'),
         url('../fonts/montserrat-v14-latin-regular.ttf') format('truetype'),
         url('../fonts/montserrat-v14-latin-regular.svg#Montserrat') format('svg');
  }
  
  .rounded-large {
    border-radius: 16px;
  }
  .rounded-largest {
    border-radius: 24px;
  }
  .text-smallest {
    font-size: 9px;
  }
</style>

<Navbar on:search={toggleSearchNav} {filter} />
<Stays stays={staysCopy} />
<SearchNav
  visible={nav}
  on:close={closeSearchNav}
  {locationList}
  on:search={handleSearch} />
<Footer />
