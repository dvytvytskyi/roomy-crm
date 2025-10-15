import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo/index.js";
import React, {useEffect, useRef, useState} from "react";
import "../styles/components/searchBlock.scss"
import dayjs from "dayjs";

const SearchBlock = ({data, setData, setShowSelect}) => {
    const [selectedParam, setSelectedParam] = useState(null)
    const [openCalendar, setOpenCalendar] = useState(false)
    const dropdownRef = useRef(null)

    const selectNeigborhood = (neighborhood) => {
        setData({...data, neigh: neighborhood})
        setSelectedParam('checkIn')
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
        
        // Автоматично відкриваємо dropdown при виборі 'select'
        if (selectedParam === 'select') {
            setTimeout(() => {
                if (dropdownRef.current) {
                    dropdownRef.current.focus();
                    // Спробуємо відкрити dropdown програмно
                    const event = new MouseEvent('mousedown', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                    });
                    dropdownRef.current.dispatchEvent(event);
                }
            }, 100);
        }
    }, [selectedParam])

    const handleChoosMenuParam = (param) => {
        if (param === selectedParam) {
            setSelectedParam(null)
        } else {
            setSelectedParam(param)
        }
    }

    const handleDateChange = (newValue) => {
        if (newValue[0]) {
            setSelectedParam('checkOut');
        }
        if (newValue[1].diff(newValue[0], 'day') >= 2) {
            setData({ ...data, value: newValue })
        } else {
            console.log("Виберіть діапазон тривалістю не менше 3 днів");
        }
    };
    let dataValueDayjs = data.value.map(obj => dayjs(obj.$d));
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
                    {`${data.guest ? data.guest + ' Guests' : 'Add guests'}`}
                </div>

                <div className={`people-pets ${selectedParam === 'with' ? 'active' : ''}`}>
                    <div className="count">
                        Guests
                        <div>
                            <svg onClick={(event) => {
                                event.stopPropagation();
                                data.guest > 0 && setData({...data, guest: data.guest - 1})
                            }}
                                 xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
                                 fill="none">
                                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F1F1F1"/>
                                <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            {`${data.guest ? data.guest : '0'}`}
                            <svg onClick={(event) => {
                                event.stopPropagation();
                                setData({...data, guest: data.guest + 1})
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
                    <div className="count">
                        Pets
                        <div>
                            <svg onClick={(event) => {
                                event.stopPropagation();
                                data.pets > 0 && setData({...data, pets: data.pets - 1})
                            }}
                                 xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
                                 fill="none">
                                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F1F1F1"/>
                                <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            {`${data.pets ? data.pets : '0'}`}
                            <svg onClick={(event) => {
                                event.stopPropagation();
                                setData({...data, pets: data.pets + 1})
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
                <div className="icon" onClick={() => setShowSelect(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18"
                         fill="none">
                        <circle cx="8.16656" cy="7.66656" r="6.66656" stroke="white" stroke-width="2"/>
                        <path d="M13.0547 12.5547L17.4991 16.9991" stroke="white" stroke-width="2"
                              stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateRangePicker']}>
                <DateRangePicker
                    open={openCalendar}
                    onClose={onCalendarClose}
                    value={dataValueDayjs}
                    onChange={handleDateChange}
                    minDate={dayjs()}
                    disablePast
                >
                </DateRangePicker>
            </DemoContainer>
        </LocalizationProvider>
    </div>)
}

export default SearchBlock