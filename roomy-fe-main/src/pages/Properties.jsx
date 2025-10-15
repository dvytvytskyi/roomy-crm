import '../styles/pages/properties.scss'
import Header from "../components/Header/Header.jsx";
import PorjectCard from "../components/PorjectCard.jsx";
import Footer from "../components/Footer.jsx";
import React, {useEffect, useState} from "react";
import axios from "axios";
import SearchBlock from "../components/SearchBlock.jsx";
import {useLocation} from "react-router-dom";
import dayjs from "dayjs";
import { API_ENDPOINTS, formatDateForAPI, buildQueryString } from "../config/api.js";

const Properties = () => {
    const [visibleProjects, setVisibelProjects] = useState(12)
    const [loading, setLoading] = useState(false)
    const lastModifiedTimestamp = new Date().toUTCString();
    const location = useLocation();

    // Default values if no location.state (direct navigation)
    const defaultCheckIn = dayjs().add(1, 'day');
    const defaultCheckOut = dayjs().add(4, 'day');
    
    const [serachDay, setSearchDay] = useState(location.state?.value?.[0] || defaultCheckIn)
    const [serachFinalDay, setSearchFinalDay] = useState(location.state?.value?.[1] || defaultCheckOut)
    const [projects, setProjects] = useState()
    const daysSelected = location.state?.daysDifference || 3;

    const [searchData, setSerachData] =  useState({
        "value": location.state?.value || [defaultCheckIn, defaultCheckOut],
        "guest": location.state?.peopleAmountHome || 1,
        "neigh": null
    })

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                // Format dates for API
                const checkIn = formatDateForAPI(serachDay);
                const checkOut = formatDateForAPI(serachFinalDay);
                
                // Build query parameters
                const params = {
                    checkIn,
                    checkOut,
                    minOccupancy: 1,
                    limit: 45,
                    page: 1
                };
                
                // Додаємо фільтр по локації якщо вибрано
                if (searchData.neigh) {
                    params.location = searchData.neigh;
                }
                
                const queryString = buildQueryString(params);
                const url = `${API_ENDPOINTS.PROPERTIES.LIST}?${queryString}`;
                
                console.log('Fetching properties from:', url);
                
                const response = await axios.get(url);
                
                if (response.data.success) {
                    setProjects(response.data.results);
                } else {
                    console.error('Failed to fetch properties:', response.data.message);
                    setProjects([]);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperties();
    }, [serachDay, serachFinalDay, searchData.neigh]); // Додаємо searchData.neigh як залежність


    return (<div className="properties">
        <Header/>
        <div className="search-block">
            <SearchBlock
                data={searchData}
                setData={setSerachData}
            />
        </div>

        {loading ? (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading properties...</p>
            </div>
        ) : (
            <div className={`projects ${visibleProjects >= projects?.length && 'bottom-p'}`}>
                {
                    projects?.slice(0, visibleProjects).map((project, index) => (
                        <PorjectCard
                            key={index}
                            project={project}
                            daysSelected={daysSelected}
                            data={searchData}
                        />
                    ))
                }
            </div>
        )}
        {
            visibleProjects <= projects?.length && <div className="show">
                <div className="show-more" onClick={() => setVisibelProjects(visibleProjects + 8)}>Show more</div>
            </div>
        }
        <Footer/>
    </div>)
}

export default Properties