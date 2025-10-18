import '../styles/pages/properties.scss'
import Header from "../components/Header/Header.jsx";
import PorjectCard from "../components/PorjectCard.jsx";
import Footer from "../components/Footer.jsx";
import React, {useEffect, useState} from "react";
import axios from "axios";
import SearchBlock from "../components/SearchBlock.jsx";
import {useLocation, useSearchParams, useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import { API_ENDPOINTS, formatDateForAPI, buildQueryString } from "../config/api.js";

const Properties = () => {
    const [visibleProjects, setVisibelProjects] = useState(12)
    const [loading, setLoading] = useState(false)
    const lastModifiedTimestamp = new Date().toUTCString();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 🎯 Читаємо ВСІ параметри з URL
    const urlArea = searchParams.get('area') || searchParams.get('location');
    const urlCheckIn = searchParams.get('checkIn');
    const urlCheckOut = searchParams.get('checkOut');
    const urlGuests = searchParams.get('guests') || searchParams.get('minGuests');
    const urlType = searchParams.get('type');
    const urlRooms = searchParams.get('rooms');
    const urlPriceMin = searchParams.get('price_min') || searchParams.get('priceMin');
    const urlPriceMax = searchParams.get('price_max') || searchParams.get('priceMax');
    
    // Default values if no location.state (direct navigation)
    const defaultCheckIn = dayjs().add(1, 'day');
    const defaultCheckOut = dayjs().add(4, 'day');
    
    // Використовуємо URL параметри якщо є, інакше беремо з state
    const initialCheckIn = urlCheckIn ? dayjs(urlCheckIn) : location.state?.value?.[0];
    const initialCheckOut = urlCheckOut ? dayjs(urlCheckOut) : location.state?.value?.[1];
    const initialGuests = urlGuests ? parseInt(urlGuests) : location.state?.peopleAmountHome || 1;
    const initialArea = urlArea || location.state?.selectedArea;
    
    const [serachDay, setSearchDay] = useState(initialCheckIn || null)
    const [serachFinalDay, setSearchFinalDay] = useState(initialCheckOut || null)
    const [projects, setProjects] = useState()
    const daysSelected = location.state?.daysDifference || 3;

    const [searchData, setSerachData] =  useState({
        "value": [initialCheckIn, initialCheckOut] || [null, null],
        "minGuests": initialGuests,
        "neigh": initialArea || null
    })

    // 🔄 Основна логіка завантаження проектів
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            
            try {
                // 🎯 1. Build query parameters - починаємо з базових
                const params = {
                    limit: 45,
                    page: 1
                };
                
                // 🎯 2. Додаємо фільтри ТІЛЬКИ якщо вони є в URL
                if (urlArea) {
                    params.location = urlArea;
                }
                
                if (urlCheckIn && urlCheckOut) {
                    params.checkIn = urlCheckIn;
                    params.checkOut = urlCheckOut;
                }
                
                if (urlGuests && parseInt(urlGuests) > 1) {
                    params.minOccupancy = parseInt(urlGuests);
                }
                
                if (urlType) {
                    params.type = urlType;
                }
                
                if (urlRooms) {
                    params.rooms = parseInt(urlRooms);
                }
                
                if (urlPriceMin) {
                    params.priceMin = parseFloat(urlPriceMin);
                }
                
                if (urlPriceMax) {
                    params.priceMax = parseFloat(urlPriceMax);
                }
                
                // 🎯 3. Логування для дебагу
                const hasFilters = Object.keys(params).length > 2; // більше ніж limit і page
                console.log(hasFilters ? '🔍 Завантаження з фільтрами:' : '📋 Завантаження всіх проектів (без фільтрів)');
                console.log('📋 Параметри запиту:', params);
                
                // 🎯 4. Формуємо URL
                const queryString = buildQueryString(params);
                const url = `${API_ENDPOINTS.PROPERTIES.LIST}?${queryString}`;
                console.log('🔗 URL запиту:', url);
                
                // 🎯 5. Виконуємо запит
                const response = await axios.get(url);
                
                if (response.data.success) {
                    console.log('✅ Отримано проектів:', response.data.results.length);
                    console.log('📊 Загальна кількість:', response.data.total);
                    setProjects(response.data.results);
                } else {
                    console.error('❌ Помилка відповіді:', response.data.message);
                    setProjects([]);
                }
            } catch (error) {
                console.error('❌ Помилка завантаження:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperties();
    }, [searchParams]); // ✅ Перезавантажуємо при зміні будь-якого параметра URL

    // 🧹 Функція для очищення всіх фільтрів
    const clearFilters = () => {
        console.log('🧹 Очищення всіх фільтрів...');
        navigate('/properties'); // Редірект на /properties без параметрів
        // Також очищаємо локальний стан
        setSerachData({
            "value": [null, null],
            "minGuests": 1,
            "neigh": null
        });
    };

    // 🔍 Перевірка чи є активні фільтри
    const hasActiveFilters = urlArea || urlCheckIn || urlCheckOut || urlGuests || urlType || urlRooms || urlPriceMin || urlPriceMax;

    return (<div className="properties">
        <Header/>
        <div className="search-block">
            <SearchBlock
                data={searchData}
                setData={setSerachData}
                loading={loading}
            />
            
            {/* 🧹 Кнопка очищення фільтрів */}
            {hasActiveFilters && (
                <div className="filters-info">
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Очистити всі фільтри
                    </button>
                </div>
            )}
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