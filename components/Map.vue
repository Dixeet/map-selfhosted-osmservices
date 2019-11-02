<template>
  <div class="map-container">
    <MglMap
      :map-style="mapStyle"
      :center="center"
      :zoom="zoom"
      :attribution-control="false"
      hash
      @click="onClick"
    >
      <MglAttributionControl
        position="bottom-right"
        :custom-attribution="customAttribution"
      />
      <MglNavigationControl position="top-right" />
      <MglGeolocateControl
        position="top-right"
        :fit-bounds-options="{ maxZoom: 18 }"
      />
      <MglGeojsonLayer
        source-id="test"
        :source="geoJsonSource"
        layer-id="lines"
        :layer="geoJsonLayer"
      />
      <MglMarker
        v-if="coordinatesDeparture && coordinatesDeparture.length"
        :coordinates="coordinatesDeparture"
        :offset="[0, -17, 0]"
        color="blue"
      />
      <MglMarker
        v-if="coordinatesArrival && coordinatesArrival.length"
        :offset="[0, -17, 0]"
        :coordinates="coordinatesArrival"
        color="red"
      />
    </MglMap>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MglMap,
  MglMarker,
  MglAttributionControl,
  MglNavigationControl,
  MglGeolocateControl,
  MglGeojsonLayer,
} from 'vue-mapbox';

const MAP_STYLE_URL = process.env.mapStyleUrl;
// eslint-disable-next-line no-unused-vars
const GEOCODING_URL = process.env.geocodingUrl;
const ROUTING_URL = process.env.routingUrl;
const DEFAULT_LNG_LAT = {
  lng: 2.188494937155042,
  lat: 48.88198232489759,
};

export default {
  components: {
    MglMap,
    MglMarker,
    MglAttributionControl,
    MglNavigationControl,
    MglGeolocateControl,
    MglGeojsonLayer,
  },
  data() {
    return {
      mapStyle: MAP_STYLE_URL,
      center: [DEFAULT_LNG_LAT.lng, DEFAULT_LNG_LAT.lat],
      customAttribution: [
        "<a target='_blank' href='https://datanova.legroupe.laposte.fr/explore/dataset/liste-des-communes-francaises/table/" +
          "?disjunctive.nom_complet&disjunctive.cdc&disjunctive.cheflieu&disjunctive.dep&sort=filename'>© La Poste Communes</a>",
        "<a target='_blank' href='https://datanova.legroupe.laposte.fr/explore/dataset/laposte_hexasmal/export/" +
          '?disjunctive.code_commune_insee&disjunctive.nom_de_la_commune&disjunctive.code_postal' +
          "&disjunctive.libell_d_acheminement&disjunctive.ligne_5'>© La Poste Codes Postaux </a>",
      ],
      zoom: 16,
      geoJsonSource: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      },
      geoJsonLayer: {
        id: 'lines',
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'rgba(51,159,255,0.7)',
          'line-width': 8,
        },
      },
      coordinatesDeparture: [],
      coordinatesArrival: [],
    };
  },

  created() {
    this.mapbox = Mapbox;
  },

  methods: {
    async onClick({ mapboxEvent, map }) {
      const route = await this.$axios.$get(
        `${ROUTING_URL}${DEFAULT_LNG_LAT.lng},${DEFAULT_LNG_LAT.lat};${mapboxEvent.lngLat.lng},${mapboxEvent.lngLat.lat}`,
        {
          params: {
            alternatives: false,
            steps: false,
            annotations: false,
            geometries: 'geojson', // polyline (default), polyline6 , geojson
            overview: 'full', // simplified (default), full , false
            continue_straight: false,
          },
        },
      );
      this.coordinatesDeparture = route.waypoints[0].location;
      this.coordinatesArrival = route.waypoints[1].location;
      this.geoJsonSource.data.geometry = route.routes[0].geometry;
    },
  },
};
</script>
<style scoped>
.map-container {
  height: 100vh;
  position: relative;
}
</style>
