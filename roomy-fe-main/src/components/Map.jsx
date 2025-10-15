import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhYmxha2xha2xhIiwiYSI6ImNsdDNhbmd3cjFtYWMyanBsNGN2dWQ2Y2cifQ.sAFXCxLdlp98owHs1MahPA';
const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(55.17128);
    const [lat, setLat] = useState(25.0657);
    const [zoom, setZoom] = useState(9);


    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/blablaklakla/cltarljag00id01nw45wf3x8q',
            center: [lng, lat],
            zoom: zoom
        });

        map.current.on("wheel", event => {
            if (event.originalEvent.ctrlKey) {
                return;
            }

            if (event.originalEvent.metaKey) {
                return;
            }

            if (event.originalEvent.altKey) {
                return;
            }

            event.preventDefault();
        });
    });



    return (<div ref={mapContainer} className="map-container"/>)
}

export default Map


