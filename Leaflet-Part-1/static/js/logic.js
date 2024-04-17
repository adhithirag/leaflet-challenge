// store the API endpoint as a query url 
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// performing a Get request to the query url
d3.json(queryUrl).then(function(data){
    createFeatures(data.features);
});


function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        // Create HTML content for the popup
        let popupContent = `<h3>${feature.properties.place}</h3><hr>`;
        popupContent += `<p><strong>Magnitude:</strong> ${feature.properties.mag}</p>`;
        popupContent += `<p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>`;
        popupContent += `<p><strong>Date:</strong> ${new Date(feature.properties.time)}</p>`;

        // Bind the popup to the layer (marker)
        layer.bindPopup(popupContent);
    }

    function pointToLayer(feature, latlng) {
        // Calculate marker size based on earthquake magnitude
        const markerSize = feature.properties.mag * 5; // Adjust multiplier as needed
        
        // Determine marker color based on depth
        let depthColor = getColorDepth(feature.geometry.coordinates[2]);

        // Create a CircleMarker with the specified size and color
        let marker = L.circleMarker(latlng, {
            radius: markerSize,
            fillColor: depthColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        return marker;
    }

    // Create a GeoJSON layer with custom markers.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer // Specify the pointToLayer function
    });

    createMap(earthquakes);
}

// Function to determine color based on depth
function getColorDepth(depth) {
    return depth > 70 ? '#ff0000' : // red
           depth > 50 ? '#ff8c00' : // orange
           depth > 30 ? '#ffd700' : // yellow
           depth > 10 ? '#adff2f' : // green
                        '#32cd32';   // light green
}


function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a depth legend control
    let depthLegend = L.control({ position: 'bottomright' });

    depthLegend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend'),
            depths = [-10, 10, 30, 50, 70],
            labels = [];

        // loop through our depth intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depths.length; i++) {
            let color = getColorDepth(depths[i] + 1);
            let depthRange = depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+');
            labels.push(
                '<i style="background:' + color + '"></i> ' +
                depthRange);
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    // Add depth legend to the map
    depthLegend.addTo(myMap);

}

// Function to determine color based on depth
function getColorDepth(depth) {
    return depth > 70 ? '#ff0000' : // red
           depth > 50 ? '#ff8c00' : // orange
           depth > 30 ? '#ffd700' : // yellow
           depth > 10 ? '#adff2f' : // green
                        '#32cd32';   // light green
}