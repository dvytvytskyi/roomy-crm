import HeaderTwo from "../components/Header/HeaderTwo.jsx";
import FilterAreas from "../components/FilterAreas.jsx";
import Footer from "../components/Footer.jsx";
import Map from "../components/Map.jsx";
import "../styles/pages/mapPage.scss"

const MapPage = () => {
    return(<div className="map-page">
        <HeaderTwo/>

        <FilterAreas
            filterDataProjects={''}
            setFilterDataProjects={''}
        />

        <div className="map">
            <Map/>
        </div>
        <Footer/>
    </div>)
}

export default MapPage