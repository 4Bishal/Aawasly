maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREET,
    center: listing.geometry.coordinates,
    zoom: 13,
});

map.on('load', async function () {

    map.setLanguage(maptilersdk.Language.ENGLISH);
    const image = await map.loadImage(
        '/images/coordinateIcon.png');

    map.addImage('my-marker', image.data);
    map.addSource('point', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': listing.geometry.coordinates
                    }
                }
            ]
        }
    });
    map.addLayer({
        'id': 'custom-icon-layer',
        'type': 'symbol',
        'source': 'point',
        'layout': {
            'icon-image': 'my-marker',
            'icon-size': 0.1
        }
    });
});

map.on('click', 'custom-icon-layer', function (e) {
    const coordinates = e.features[0].geometry.coordinates;
    new maptilersdk.Popup({ offset: 25 })
        .setLngLat(coordinates)
        .setHTML(`<h4>${listing.title}</h4><p>Exact Location <b>"${listing.location}"</b> will be provided after booking</p>`)
        .addTo(map);
});
