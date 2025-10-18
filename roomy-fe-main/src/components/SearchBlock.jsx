import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo/index.js";
import React, {useEffect, useRef, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/components/searchBlock.scss"
import "../styles/components/datePicker.scss"
import "../styles/test-calendar.css"
import dayjs from "dayjs";

const SearchBlock = ({data, setData, setShowSelect, loading = false}) => {
    const [selectedParam, setSelectedParam] = useState(null)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [searchUrl, setSearchUrl] = useState('/properties')
    const dropdownRef = useRef(null)
    const calendarRef = useRef(null)
    const navigate = useNavigate();

    // 🔍 Функція для пошуку з URL параметрами
    const handleSearch = () => {
        console.log('🔍 Пошук розпочато!');
        console.log('📊 Дані для пошуку:', data);
        
        // Закриваємо всі модалки
        setSelectedParam(null);
        setOpenCalendar(false);
        if (setShowSelect) setShowSelect(false);
        
        // 🎯 Формуємо query параметри (додаємо тільки заповнені)
        const params = new URLSearchParams();
        
        // Локація
        if (data.neigh) {
            params.append('area', data.neigh);
        }
        
        // Дати
        if (data.value && data.value.length === 2 && data.value[0] && data.value[1]) {
            const checkIn = dayjs(data.value[0].$d || data.value[0]).format('YYYY-MM-DD');
            const checkOut = dayjs(data.value[1].$d || data.value[1]).format('YYYY-MM-DD');
            params.append('checkIn', checkIn);
            params.append('checkOut', checkOut);
        }
        
        // Кількість гостей
        if (data.minGuests && data.minGuests > 1) {
            params.append('guests', data.minGuests);
        }
        
        // 🔗 Формуємо фінальний URL
        const queryString = params.toString();
        const finalUrl = queryString ? `/properties?${queryString}` : '/properties';
        
        console.log('🔗 Навігація до:', finalUrl);
        
        // ✅ Використовуємо navigate замість window.location.href
        navigate(finalUrl);
    }

    // Додаємо стилі динамічно після відкриття календаря
    useEffect(() => {
        if (openCalendar) {
            const addFocusStyles = () => {
                const style = document.createElement('style')
                style.textContent = `
                    .MuiPickersDay-root:focus,
                    .MuiPickersDay-root:focus-visible {
                        outline: 3px solid white !important;
                        outline-offset: 3px !important;
                        border: 2px dashed rgba(0, 0, 0, 0.5) !important;
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        box-shadow: 0 0 0 1px white !important;
                    }
                `
                document.head.appendChild(style)
                
                // Видаляємо стилі через 10 секунд
                setTimeout(() => {
                    document.head.removeChild(style)
                }, 10000)
            }
            
            setTimeout(addFocusStyles, 500)
        }
    }, [openCalendar])

    const selectNeigborhood = (neighborhood) => {
        // Якщо натискаємо на вже вибрану локацію - unselect її
        if (data.neigh === neighborhood) {
            setData({...data, neigh: ''})
            setSelectedParam(null) // Закриваємо список після unselect
        } else {
            // Інакше - вибираємо нову локацію
            setData({...data, neigh: neighborhood})
            setSelectedParam(null) // Закриваємо список після вибору
            
            // Автоматично відкриваємо календар check-in після вибору району
            setTimeout(() => {
                setOpenCalendar(true)
                // Додаємо фокус на календар після відкриття
                setTimeout(() => {
                    // Спочатку спробуємо знайти check-in input (перший input)
                    if (calendarRef.current) {
                        const inputElements = calendarRef.current.querySelectorAll('input')
                        if (inputElements.length > 0) {
                            // Фокус на перший input (check-in)
                            inputElements[0].focus()
                        }
                    }
                    
                    // Якщо не знайшли input, спробуємо кнопку дня
                    setTimeout(() => {
                        const dayButton = document.querySelector('.MuiPickersDay-root[tabindex="0"]')
                        if (dayButton) {
                            dayButton.focus()
                        }
                    }, 100)
                }, 300) // Збільшена затримка для рендерингу календаря
            }, 100) // Невелика затримка для плавного переходу
        }
    }

    // Реальні райони з CRM
    const neighborhoods = [
        "Dubai", // Місто
        "Business Bay",
        "Downtown Dubai", 
        "Dubai Marina",
        "Palm Jumeirah",
        // Додаткові популярні райони Dubai
        "Jumeirah",
        "JBR (Jumeirah Beach Residence)",
        "DIFC (Dubai International Financial Centre)",
        "JVC (Jumeirah Village Circle)",
        "Dubai Hills",
        "Damac Hills",
        "Arabian Ranches",
        "Motor City",
        "Dubai Sports City",
        "International City",
        "Discovery Gardens",
        "Dubai Silicon Oasis",
        "Dubai Investment Park",
        "Al Barsha",
        "Al Quoz",
        "Bur Dubai",
        "Deira",
        "Jumeirah Lake Towers (JLT)",
        "Dubai Festival City"
    ].sort()
    const getMonthName = (num) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[num] || "Invalid month number";
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const element = document.querySelector('div[style="position: absolute; pointer-events: none; color: rgba(130, 130, 130, 0.62); z-index: 100000; width: 100%; text-align: center; bottom: 50%; right: 0px; letter-spacing: 5px; font-size: 24px;"]');

            if (element) {
                element.style.display = 'none';
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        selectedParam === 'checkIn' ? setOpenCalendar(true) : null
        selectedParam === 'checkOut' ? setOpenCalendar(true) : null
        
        // Для 'select' не відкриваємо dropdown - одразу показуємо список районів
    }, [selectedParam])

    const handleChoosMenuParam = (param) => {
        if (param === selectedParam) {
            setSelectedParam(null)
        } else {
            setSelectedParam(param)
        }
    }

    const handleDateChange = (newValue) => {
        if (newValue && newValue[0]) {
            setSelectedParam('checkOut');
        }
        if (newValue && newValue[0] && newValue[1] && newValue[1].diff(newValue[0], 'day') >= 2) {
            setData({ ...data, value: newValue })
        } else if (newValue && newValue[0] && newValue[1]) {
            console.log("Виберіть діапазон тривалістю не менше 3 днів");
        }
    };
    let dataValueDayjs = data.value?.map(obj => dayjs(obj?.$d)) || [null, null];
    const onCalendarClose = () => {
        setOpenCalendar(false)
        setSelectedParam('with')
    }

    return (<div className="search-main-block">
        <div className={`search-bar ${selectedParam === null ? 'white' : ''}`}>
            <div onClick={() => handleChoosMenuParam('select')}
                className={`check-search ${selectedParam === 'select' ? 'active' : ''}`}>
                <div className="title">Select Area</div>
                <div className="subtitle" >
                    {`${data.neigh ? data.neigh: 'Choose your place' }`}
                </div>

                <div className={`search-by-neighborhood ${selectedParam === 'select' ? 'active' : ''} `}>
                    <div className="title">Search by neighborhood</div>

                    <div className={`dropdown-container`}>
                        <select 
                            ref={dropdownRef}
                            className="location-dropdown"
                            value={data.neigh || ''}
                            onChange={(e) => {
                                e.stopPropagation();
                                selectNeigborhood(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <option value="">All Areas</option>
                            {neighborhoods.map((neighborhood, index) => (
                                <option key={index} value={neighborhood}>
                                    {neighborhood}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div onClick={() => handleChoosMenuParam('checkIn')}
                className={`check in ${selectedParam === 'checkIn' ? 'active' : ''}`}>
                <div className="title">Check in</div>
                <div className="subtitle">{data.value[0] && data.value[0].$D ? data.value[0].$D + ' ' + getMonthName(data.value[0].$M) + ' ' : 'Add dates '}</div>
            </div>

            <div onClick={() => handleChoosMenuParam('checkOut')}
                 className={`check out ${selectedParam === 'checkOut' ? 'active' : ''}`}>
                <div className="title">Check out</div>
                <div
                    className="subtitle">{data.value[1] && data.value[1].$D ? data.value[1].$D + ' ' + getMonthName(data.value[1].$M) + ' ' : 'Add dates '}</div>
            </div>

            <div onClick={() => handleChoosMenuParam('with')}
                 className={`with-whom check ${selectedParam === 'with' ? 'active' : ''}`}>
            <div className="title">With whom</div>
                <div className="subtitle">
                    {data.minGuests ? `Min ${data.minGuests} Guests` : 'Min 1 Guests'}
                </div>

                <div className={`people-pets ${selectedParam === 'with' ? 'active' : ''}`}>
                    <div className="count">
                        Minimum Guests
                        <div>
                        <svg onClick={(event) => {
                            event.stopPropagation();
                            if (data.minGuests && data.minGuests > 1) {
                                setData({...data, minGuests: data.minGuests - 1})
                            }
                        }}
                                 xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
                                 fill="none">
                                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F1F1F1"/>
                                <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            {data.minGuests || 1}
                            <svg onClick={(event) => {
                                event.stopPropagation();
                                const minGuests = Math.min(20, (data.minGuests || 1) + 1);
                                setData({...data, minGuests: minGuests})
                            }}
                                 xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
                                 fill="none">
                                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F1F1F1"/>
                                <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2" stroke-linecap="round"/>
                                <path d="M16.25 10.75L16.25 21.25" stroke="#F1F1F1" stroke-width="2"
                                      stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`search-icon ${selectedParam === 'with' ? 'active' : ''}`}>
                <button className="icon" onClick={handleSearch} title="Пошук нерухомості" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18"
                         fill="none" style={{ cursor: 'pointer' }}>
                        <circle cx="8.16656" cy="7.66656" r="6.66656" stroke="white" stroke-width="2"/>
                        <path d="M13.0547 12.5547L17.4991 16.9991" stroke="white" stroke-width="2"
                              stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateRangePicker']}>
                <div ref={calendarRef} style={{
                    '--mui-pickers-day-focus-outline': '2px solid white',
                    '--mui-pickers-day-focus-outline-offset': '2px',
                    '--mui-pickers-day-focus-border': '1px dashed rgba(0, 0, 0, 0.3)'
                }}>
                    <DateRangePicker
                        open={openCalendar}
                        onClose={onCalendarClose}
                        value={dataValueDayjs}
                        onChange={handleDateChange}
                        minDate={dayjs()}
                        disablePast
                        slotProps={{
                            day: {
                                sx: {
                                    '&:focus': {
                                        outline: '2px solid white !important',
                                        outlineOffset: '2px !important',
                                        border: '1px dashed rgba(0, 0, 0, 0.3) !important'
                                    },
                                    '&:focus-visible': {
                                        outline: '2px solid white !important',
                                        outlineOffset: '2px !important',
                                        border: '1px dashed rgba(0, 0, 0, 0.3) !important'
                                    }
                                }
                            },
                            textField: {
                                sx: {
                                    '&:first-child input:focus': {
                                        outline: '2px solid white !important',
                                        outlineOffset: '2px !important',
                                        border: '1px dashed rgba(0, 0, 0, 0.3) !important'
                                    }
                                }
                            }
                        }}
                    >
                    </DateRangePicker>
                </div>
            </DemoContainer>
        </LocalizationProvider>
        
        {/* Список районів як кнопки */}
        {selectedParam === 'select' && (
            <div className="neighborhoods-list">
                <div className="neighborhoods-grid">
                    {neighborhoods.map((neighborhood, index) => (
                        <button
                            key={index}
                            className={`neighborhood-btn ${data.neigh === neighborhood ? 'selected' : ''}`}
                            onClick={() => selectNeigborhood(neighborhood)}
                        >
                            {neighborhood}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>)
}

export default SearchBlock