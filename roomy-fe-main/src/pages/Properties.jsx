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
    
    const [serachDay, setSearchDay] = useState(location.state?.value?.[0] || null)
    const [serachFinalDay, setSearchFinalDay] = useState(location.state?.value?.[1] || null)
    const [projects, setProjects] = useState()
    const daysSelected = location.state?.daysDifference || 3;

    const [searchData, setSerachData] =  useState({
        "value": location.state?.value || [null, null], // Пусті дати по дефолту
        "minGuests": location.state?.peopleAmountHome || 1, // Мінімум 1 гість по дефолту
        "neigh": null // Пустий район
    })

    useEffect(() => {
        const fetchProperties = async () => {
            console.log('🔄 Автоматичний запит при зміні параметрів:', {
                neigh: searchData.neigh,
                minGuests: searchData.minGuests,
                checkIn: serachDay,
                checkOut: serachFinalDay
            });
            
            // Завжди робимо запит, щоб показати проекти
            console.log('🔄 Запитуємо проекти з фільтрами:', {
                neigh: searchData.neigh,
                minGuests: searchData.minGuests,
                checkIn: serachDay,
                checkOut: serachFinalDay
            });
            
            setLoading(true);
            try {
                // Build query parameters
                const params = {
                    limit: 45,
                    page: 1
                };
                
                // Додаємо дати тільки якщо вони вибрані
                if (serachDay && serachFinalDay) {
                    params.checkIn = formatDateForAPI(serachDay);
                    params.checkOut = formatDateForAPI(serachFinalDay);
                }
                
                // Додаємо мінімальну кількість гостей тільки якщо вона більше 1
                if (searchData.minGuests && searchData.minGuests > 1) {
                    params.minOccupancy = searchData.minGuests;
                }
                
                // Додаємо фільтр по локації якщо вибрано
                if (searchData.neigh) {
                    params.location = searchData.neigh;
                }
                
                console.log('📋 Параметри запиту:', params);
                
                const queryString = buildQueryString(params);
                const url = `${API_ENDPOINTS.PROPERTIES.LIST}?${queryString}`;
                
                console.log('🔗 URL запиту:', url);
                
                const response = await axios.get(url);
                
                if (response.data.success) {
                    console.log('✅ Отримано проекти:', response.data.results.length);
                    console.log('📊 Загальна кількість в БД:', response.data.total);
                    console.log('📄 Поточна сторінка:', response.data.page);
                    console.log('🔢 Ліміт на сторінку:', response.data.limit);
                    setProjects(response.data.results);
                } else {
                    console.error('❌ Failed to fetch properties:', response.data.message);
                    setProjects([]);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
                    console.error('Network error - backend might be down');
                    // Додаємо fallback дані для тестування
                    setProjects([]);
                } else {
                    setProjects([]);
                }
            } finally {
                setLoading(false);
            }
        };
        
        // Додаємо невелику затримку щоб уникнути зациклювання
        const timeoutId = setTimeout(fetchProperties, 100);
        
        return () => clearTimeout(timeoutId);
    }, [serachDay, serachFinalDay, searchData.neigh, searchData.minGuests]); // Автоматичні запити при зміні параметрів


    return (<div className="properties">
        <Header/>
        <div className="search-block">
            <SearchBlock
                data={searchData}
                setData={setSerachData}
                loading={loading}
            />
        </div>

        {loading ? (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading properties...</p>
            </div>
        ) : (
            <div className={`projects ${visibleProjects >= (projects?.length || 0) && 'bottom-p'}`}>
                {projects && projects.length > 0 ? (
                    projects.slice(0, visibleProjects).map((project, index) => (
                        <PorjectCard
                            key={index}
                            project={project}
                            daysSelected={daysSelected}
                            data={searchData}
                        />
                    ))
                ) : (
                    <div className="no-projects">
                        <h3>No properties found</h3>
                        <p>Try adjusting your search filters or check back later.</p>
                    </div>
                )}
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