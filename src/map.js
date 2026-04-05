// Leaflet map setup and Fluxnet site visualization
// ----------------------------
// Imports
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Vite: treat CSV as an imported URL so it is served from the dev/build server
import fluxnetCsvUrl from "./assets/fluxnet_sites.csv?url";

// Initialize the Leaflet map and set a world view (latitude, longitude, zoom)
const map = L.map("fluxnet-map").setView([20, 0], 1);

// Add a dark basemap layer (Carto Dark)
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 10,
}).addTo(map);

// Color palettes for different classification schemes (used for marker colors)
const colorPalettes = {
  IGBP: {
    Forest: "#2ea84b",
    Grassland: "#98df8a",
    Savanna: "#bfa780",
    Cropland: "#e2a336",
    Shrubland: "#8c564b",
    Wetland: "#17becf",
    default: "#ffffff",
  },
  Koppen: {
    Cold: "#1f77b4",
    Arid: "#d69e2e",
    Temperate: "#2ca02c",
    Tropical: "#d62728",
    Polar: "#e0e0e0",
    default: "#ffffff",
  },
};

// Application state
let fluxnetData = []; // Parsed CSV rows will be stored here
const layerGroup = L.layerGroup().addTo(map); // Container for site markers
let legendControl; // Tracks the active legend control so it can be removed/updated

// Fetch the CSV (asset URL provided by Vite) and parse it
fetch(fluxnetCsvUrl)
  .then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.text();
  })
  .then((csvText) => {
    // Parse CSV and draw initial markers using the `IGBP` category
    fluxnetData = parseCSV(csvText);
    drawMarkers("IGBP");
  })
  .catch((err) => console.error("Failed to load CSV:", err));

// Wire up a category select element to re-draw markers when changed
document
  .getElementById("map-category-select")
  ?.addEventListener("change", (e) => {
    drawMarkers(e.target.value);
  });

// Draw markers for the given classification `category` (e.g., 'IGBP' or 'Koppen')
function drawMarkers(category) {
  // Clear previous markers
  layerGroup.clearLayers();
  const categoriesFound = new Set();

  // Loop over parsed CSV rows and add a circle marker per valid site
  fluxnetData.forEach((site) => {
    // Parse numeric coordinates from CSV string values
    const lat = parseFloat(site.latitude);
    const lon = parseFloat(site.longitude);

    // Skip rows with missing/invalid coordinates
    if (isNaN(lat) || isNaN(lon)) return;

    // Determine the category value for this site and collect for legend
    const catValue = site[category];
    if (catValue) categoriesFound.add(catValue);

    // Resolve marker color from the palette, fallback to default
    const markerColor =
      colorPalettes[category][catValue] || colorPalettes[category]["default"];

    // Create a styled circle marker and attach a small popup
    const marker = L.circleMarker([lat, lon], {
      radius: 5,
      fillColor: markerColor,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }).bindPopup(`
      <div style="font-family: sans-serif; padding: 5px;">
        <strong style="color: #bfa780; font-size: 1.1em;">${site.site_id}</strong><br/>
        <span style="color: #555;">IGBP:</span> ${site.IGBP}<br/>
        <span style="color: #555;">Koppen:</span> ${site.Koppen}
      </div>
    `);

    // Add marker to the shared layer group
    layerGroup.addLayer(marker);
  });

  // Update the legend with all categories found for the selected classification
  updateLegend(category, Array.from(categoriesFound).sort());
}

// Create or replace the legend control for the current category
function updateLegend(category, categories) {
  // Remove the old native control if it exists
  if (legendControl) {
    map.removeControl(legendControl);
  }

  // Generate a new native Leaflet control
  legendControl = L.control({ position: "bottomright" });

  legendControl.onAdd = function () {
    // Build a small info box for the legend
    const div = L.DomUtil.create("div", "info legend");
    div.style.background = "rgba(30, 30, 30, 0.8)";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";

    // Create an entry per category using the configured palette
    div.innerHTML = categories
      .map((cat) => {
        const color =
          colorPalettes[category][cat] || colorPalettes[category]["default"];
        return `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; border: 1px solid #333;"></div>
          <span style="font-size: 0.85rem; color: #ddd;">${cat}</span>
        </div>`;
      })
      .join("");

    return div;
  };

  // Add the constructed control to the map
  legendControl.addTo(map);
}

// Lightweight CSV parser: assumes comma-separated, no quoted commas
function parseCSV(text) {
  // Remove BOM if present, trim, and split into lines
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split("\n");
  if (lines.length < 2) return [];

  // First line contains headers used as object keys
  const headers = lines[0].split(",").map((h) => h.trim());

  // Map remaining lines to objects keyed by header names
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] ? values[index].trim() : undefined;
      return obj;
    }, {});
  });
}
