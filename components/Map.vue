<template>
  <div class="map-container">
    <MglMap
      :map-style="mapStyle"
      :center="center"
      :zoom="zoom"
      :attribution-control="false"
      @click="onClick"
      @load="onMapLoaded"
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
        :coordinates="departure.markerCoordinates"
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
    <div class="routing">
      <el-autocomplete
        v-model="departure.name"
        class="inline-input"
        placeholder="Please Input"
        value-key="name"
        clearable
        :trigger-on-focus="false"
        :fetch-suggestions="searchRoute"
        :debounce="500"
        @select="selectDeparture"
      ></el-autocomplete>
    </div>
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
const DEFAULT_COORDS = {
  center: [2.789, 46.752],
  zoom: 5.5,
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
      ...DEFAULT_COORDS,
      customAttribution: [
        "<a target='_blank' href='https://datanova.legroupe.laposte.fr/explore/dataset/liste-des-communes-francaises/table/" +
          "?disjunctive.nom_complet&disjunctive.cdc&disjunctive.cheflieu&disjunctive.dep&sort=filename'>© La Poste Communes</a>",
        "<a target='_blank' href='https://datanova.legroupe.laposte.fr/explore/dataset/laposte_hexasmal/export/" +
          '?disjunctive.code_commune_insee&disjunctive.nom_de_la_commune&disjunctive.code_postal' +
          "&disjunctive.libell_d_acheminement&disjunctive.ligne_5'>© La Poste Codes Postaux </a>",
      ],
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
      departure: {
        name: '',
        coordinates: [],
        markerCoordinates: [],
      },
    };
  },

  created() {
    this.mapbox = Mapbox;
  },

  methods: {
    async onClick({ mapboxEvent, map }) {
      const route = await this.$axios.$get(
        `${ROUTING_URL}route/v1/walking/${DEFAULT_LNG_LAT.lng},${DEFAULT_LNG_LAT.lat};${mapboxEvent.lngLat.lng},${mapboxEvent.lngLat.lat}`,
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
    async searchRoute(search, cb) {
      let res = [];
      if (search && search.length > 3) {
        const {
          data: { results },
        } = await this.$axios.get(`${GEOCODING_URL}q/${search}.js`);
        res = results.slice(0, 5);
      }
      // eslint-disable-next-line standard/no-callback-literal
      cb(res);
    },
    async selectDeparture({ display_name: name, lon, lat }) {
      Object.assign(this.departure, { name, coordinates: [lon, lat] });
      const flyTo = this.actions.flyTo({
        center: this.departure.coordinates,
        zoom: 16,
      });
      const nearestReq = this.$axios.get(
        `${ROUTING_URL}nearest/v1/walking/${lon},${lat}`,
      );
      await flyTo;
      const nearest = await nearestReq;
      console.log(nearest);
    },
    onMapLoaded({ component }) {
      this.actions = component.actions;
    },
  },
};
</script>
<style scoped lang="scss">
.map-container {
  height: 100vh;
  position: relative;
  .routing {
    position: absolute;
    top: 5px;
    left: 5px;
    .inline-input {
      min-width: 350px;
    }
  }
}
</style>
