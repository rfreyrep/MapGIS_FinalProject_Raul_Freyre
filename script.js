// 1st. Create the map
const map = L.map("map").setView([43.0, -107.5], 6);

// Dark basemap
const darkBasemap = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> ' +
      '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// Light basemap
const lightBasemap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }
);

const baseMaps = {
  "Dark Basemap": darkBasemap,
  "Light Basemap": lightBasemap,
};

// =======================================
// MarkerCluster group for all crashes
// =======================================
const crashClusters = L.markerClusterGroup({
  disableClusteringAtZoom: 13,
  zoomToBoundsOnClick: true,
  spiderfyOnMaxZoom: true,
});
map.addLayer(crashClusters);

// arrays and filters
const allMarkers = [];

const weatherFilters = {
  dry: true,
  winter: true,
  rain: true,
  other: true,
};

const roadTypeFilters = {
  urban: true,
  rural: true,
};

// =======================================
// Categorizing road condition into weather
// =======================================
function getWeatherCategory(roadCondition) {
  const c = (roadCondition || "").toLowerCase();

  if (!c) return "other";

  const winterKeywords = ["ice", "frost", "sand on icy road", "slush", "snow"];
  if (winterKeywords.some((kw) => c.includes(kw))) return "winter";

  if (c.includes("wet")) return "rain";

  if (c.includes("dry")) return "dry";

  return "other";
}

// color per category
function getColorForWeatherCategory(cat) {
  switch (cat) {
    case "dry":
      return "#40ec0cff";
    case "winter":
      return "#368fe9ff";
    case "rain":
      return "#f52b2bff";
    case "other":
      return "#f08f08ff";
    default:
      return "#f1f501ff";
  }
}

// Normalize road_type in urban/rural
function getRoadTypeCategory(roadType) {
  const r = (roadType || "").toLowerCase();
  if (r.includes("urban")) return "urban";
  if (r.includes("rural")) return "rural";
  return "rural";
}

// =======================================
// refresh markers based on filters
// =======================================
function refreshMarkers() {
  crashClusters.clearLayers();

  const visibleLatLngs = [];
//first use of the foreach loop function here
  allMarkers.forEach((marker) => {
    const wCat = marker._weatherCat;
    const rCat = marker._roadTypeCat;

    const weatherOk = weatherFilters[wCat];
    const roadOk = roadTypeFilters[rCat];

    if (weatherOk && roadOk) {
      crashClusters.addLayer(marker);
      visibleLatLngs.push(marker.getLatLng());
    }
  });

  if (visibleLatLngs.length > 0) {
    const bounds = L.latLngBounds(visibleLatLngs);
    map.fitBounds(bounds, { padding: [20, 20] });
  }
}

// =======================================
// load the CSV and create markers with breakdown
// =======================================
function loadCrashesCSV() {
  Papa.parse("crashes_cleaned.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      const rows = results.data;
      allMarkers.length = 0;

      // ------------------------------------
      // build dictionary of breakdowns
      // ------------------------------------
      const crashBreakdown = {};
       // Second use of the foreach loop function here
      rows.forEach((row) => {
        const lat = parseFloat(row.LAT);
        const lon = parseFloat(row.LON);
        if (isNaN(lat) || isNaN(lon)) return;

        const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
        const wxCat = getWeatherCategory(row.road_condition);

        if (!crashBreakdown[key]) {
          crashBreakdown[key] = { total: 0, dry: 0, winter: 0, rain: 0, other: 0 };
        }

        crashBreakdown[key].total++;
        crashBreakdown[key][wxCat]++;
      });

      // ------------------------------------
      // create markers with popup
      // ------------------------------------
      // Third one 
      rows.forEach((row) => {
        const lat = parseFloat(row.LAT);
        const lon = parseFloat(row.LON);

        if (isNaN(lat) || isNaN(lon)) return;

        const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
        const breakdown = crashBreakdown[key];

        const crashCase = row.crash_case;
        const year = row.year;
        const county = row.county;
        const city = row.city;
        const intersection = row.intersection;
        const roadType = row.road_type;
        const roadCondition = row.road_condition;

        const weatherCat = getWeatherCategory(roadCondition);
        const roadTypeCat = getRoadTypeCategory(roadType);
        const color = getColorForWeatherCategory(weatherCat);

        const marker = L.circleMarker([lat, lon], {
          radius: 6,
          color: color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: 1,
        });

        marker._weatherCat = weatherCat;
        marker._roadTypeCat = roadTypeCat;

        const popupHtml = `
          <b>Crash Case:</b> ${crashCase ?? "N/A"}<br>
          <b>Year:</b> ${year ?? "N/A"}<br>
          <b>Road Condition:</b> ${roadCondition ?? "N/A"}<br>
          <b>Intersection:</b> ${intersection ?? "N/A"}<br>
          <b>Road Type:</b> ${roadType ?? "N/A"}<br>
          <b>City / County:</b> ${city ?? "N/A"} / ${county ?? "N/A"}<br>
          <b>Coordinates:</b> ${lat.toFixed(5)}, ${lon.toFixed(5)}<br><br>

          <b>Total crashes at this location:</b> ${breakdown.total}<br>
          <b>Winter crashes:</b> ${breakdown.winter}<br>
          <b>Rain crashes:</b> ${breakdown.rain}<br>
          <b>Dry crashes:</b> ${breakdown.dry}<br>
          <b>Other crashes:</b> ${breakdown.other}
        `;

        marker.bindPopup(popupHtml);

        // zoom to this crash on click
        marker.on("click", () => {
          const targetZoom = Math.max(map.getZoom(), 12);
          map.setView([lat, lon], targetZoom);
        });

        allMarkers.push(marker);
      });

      refreshMarkers();
    },

    error: function (err) {
      console.error("Error loading CSV:", err);
    },
  });
}

loadCrashesCSV();

// ==========================
// layer control
// ==========================
const overlayMaps = {
  "Crash Clusters": crashClusters,
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// ======================================
// weather & roadType filters
// ======================================
const filterControl = L.control({ position: "topright" });

filterControl.onAdd = function (map) {
  const div = L.DomUtil.create("div", "filter-control");

  div.innerHTML = `
    <div class="filter-group">
      <h3>Weather</h3>
      <label><input type="checkbox" data-filter-type="weather" data-filter-key="dry" checked /> Dry</label>
      <label><input type="checkbox" data-filter-type="weather" data-filter-key="winter" checked /> Winter</label>
      <label><input type="checkbox" data-filter-type="weather" data-filter-key="rain" checked /> Rain</label>
      <label><input type="checkbox" data-filter-type="weather" data-filter-key="other" checked /> Other</label>
    </div>
    <div class="filter-group">
      <h3>Road Type</h3>
      <label><input type="checkbox" data-filter-type="roadType" data-filter-key="urban" checked /> Urban</label>
      <label><input type="checkbox" data-filter-type="roadType" data-filter-key="rural" checked /> Rural</label>
    </div>
  `;

  L.DomEvent.disableClickPropagation(div);
  return div;
};

filterControl.addTo(map);

function setupFilterEvents() {
  const inputs = document.querySelectorAll(".filter-control input[type='checkbox']");
  inputs.forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const type = e.target.getAttribute("data-filter-type");
      const key = e.target.getAttribute("data-filter-key");
      const checked = e.target.checked;

      if (type === "weather") weatherFilters[key] = checked;
      if (type === "roadType") roadTypeFilters[key] = checked;

      refreshMarkers();
    });
  });
}
setupFilterEvents();
