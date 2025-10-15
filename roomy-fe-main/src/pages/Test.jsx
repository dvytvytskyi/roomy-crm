import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";


mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhYmxha2xha2xhIiwiYSI6ImNsdDNhbmd3cjFtYWMyanBsNGN2dWQ2Y2cifQ.sAFXCxLdlp98owHs1MahPA';
const Test = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);


    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [lng, lat],
                zoom: zoom,
            });
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

    }, [lng, lat, zoom, ]);



    return (<div>
        <div ref={mapContainer} style={{height: '90vh', width: '100vw'}} className="map-block"></div>
    </div>)
}

export default Test


