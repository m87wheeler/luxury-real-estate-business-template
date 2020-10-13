<script>
  import { onMount } from 'svelte';

  export let width = '100%';
  export let height = '100%';

  const initialView = [51.5128, -0.1495];
  let token =
    'pk.eyJ1IjoibTg3d2hlZWxlciIsImEiOiJja2c2dnMycmUwMWV1MnJsMWY0aHF1ZHprIn0.5BWusW01DG0yz7BO19rC-Q';

  const createMap = container => {
    let m = L.map(container, { preferCanvas: true }).setView(initialView, 20);
    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: token,
      }
    ).addTo(m);
    let marker = L.marker([51.5128, -0.1495]).addTo(m);

    return m;
  };

  onMount(() => {
    createMap('mapid');
  });
</script>

<style type="text/scss">
</style>

<div id="mapid" style={`width: ${width}; height: ${height}`} />
