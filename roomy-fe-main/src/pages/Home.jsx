import '../styles/pages/home.scss'

import "swiper/css";

import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer.jsx";
import AppleLiquidGlass from "../components/AppleLiquidGlass.jsx";

import baner from "../assets/home/baner.png"
import acc1 from "../assets/components/accommodation/acc1.png"
import acc2 from "../assets/components/accommodation/acc2.png"
import acc3 from "../assets/components/accommodation/acc3.png"
import virLogo from "../assets/components/vir.png"
import dLogo from "../assets/components/d.png"
import emiratesLogo from "../assets/components/emirates.png"

import infoCard1 from "../assets/home/info-cards/info-card1.png"
import infoCard2 from "../assets/home/info-cards/info-card2.png"
import infoCard3 from "../assets/home/info-cards/info-card3.jfif"
import infoCard4 from "../assets/home/info-cards/info-card4.jfif"
import infoCard5 from "../assets/home/info-cards/info-card5.jfif"

import test1 from "../assets/home/testimonials/test1.jfif"
import test2 from "../assets/home/testimonials/test2.jfif"
import test3 from "../assets/home/testimonials/test3.jfif"

import arrow from "../assets/home/testimonials/arrow.png"

import React, {useEffect, useState} from "react";
import RoomWithRoomy from "../components/RoomWithRoomy.jsx";
import Protected from "../components/Protected.jsx";
import Comments from "../components/Comments.jsx";
import WhyLandlords from "../components/WhyLandlords.jsx";
import GetQuality from "../components/GetQuality.jsx";
import WorkingWithRoomy from "../components/WorkingWithRoomy.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo/index.js";
import dayjs from "dayjs";
import {Link, useNavigate} from "react-router-dom";


function Accommondation({img}) {
    return <div className="accommodation">
        <div className="image">
            <img src={img} alt=""/>
        </div>
        <div className="name">Lovely apartment in Downtown</div>

        <div className="price">
            215 AED
            <span> night</span>
        </div>
    </div>;
}


const Home = () => {
    const navigate = useNavigate();
    const [comment, setComment] = useState('1')
    const [value, setValue] = React.useState([dayjs(null), dayjs(null)]);
    const [open, setOpen] = useState(false);
    const [showWithWhom, setShowWithWhom] = useState(false)
    const [showAreaDropdown, setShowAreaDropdown] = useState(false)
    const [selectedArea, setSelectedArea] = useState('')
    const [peopleAmount, setPeopleAmount] = useState(null)
    const [petsAmount, setPetsAmount] = useState(null)
    const [daysDifference , setDaysDiffrence] = useState();
    
    // Список районів Dubai
    const neighborhoods = [
        "Dubai", 
        "Business Bay",
        "Downtown Dubai", 
        "Dubai Marina",
        "Palm Jumeirah",
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
    ].sort();

    const getMonthName = (num) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[num - 1] || "Invalid month number";
    }
    
    // Функція для пошуку з URL параметрами
    const handleSearch = () => {
        const params = new URLSearchParams();
        
        // Додаємо район якщо вибраний
        if (selectedArea) {
            params.append('area', selectedArea);
        }
        
        // Додаємо дати якщо вибрані
        if (value[0] && value[0].$d) {
            params.append('checkIn', dayjs(value[0]).format('YYYY-MM-DD'));
        }
        if (value[1] && value[1].$d) {
            params.append('checkOut', dayjs(value[1]).format('YYYY-MM-DD'));
        }
        
        // Додаємо кількість гостей
        if (peopleAmount) {
            params.append('guests', peopleAmount);
        }
        
        // Додаємо pets якщо є
        if (petsAmount) {
            params.append('pets', petsAmount);
        }
        
        // Переходимо на сторінку properties з параметрами
        navigate(`/properties?${params.toString()}`);
    }

    const handleDateChange = (newValue) => {
        if (newValue[1].diff(newValue[0], 'day') >= 2) {
            setValue(newValue);
            const startDate = newValue[0];
            const endDate = newValue[1];
            setDaysDiffrence(endDate.diff(startDate, 'day'));
        } else {
            console.log("Виберіть діапазон тривалістю не менше 3 днів");
        }
    };

    // Приховати watermark
    useEffect(() => {
        const interval = setInterval(() => {
            const element = document.querySelector('div[style="position: absolute; pointer-events: none; color: rgba(130, 130, 130, 0.62); z-index: 100000; width: 100%; text-align: center; bottom: 50%; right: 0px; letter-spacing: 5px; font-size: 24px;"]');
            if (element) {
                element.style.display = 'none';
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);
    
    // Закриття дропдауну при кліку поза ним
    useEffect(() => {
        if (!showAreaDropdown) return;
        
        const handleClickOutside = (event) => {
            if (!event.target.closest('.search-block')) {
                setShowAreaDropdown(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAreaDropdown]);

    // Закриття guests dropdown при кліку поза ним
    useEffect(() => {
        if (!showWithWhom) return;
        
        const handleClickOutside = (event) => {
            if (!event.target.closest('.guests-block')) {
                setShowWithWhom(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showWithWhom]);

    return (<div className="home">
        <Header/>

        <main>
            <div className="baner">
                <div className="baner-search">
                    <div className="image">
                        <img src={baner} alt=""/>
                    </div>

                    <AppleLiquidGlass 
                        className="search"
                        intensity={1.0}
                        blur={10}
                        saturation={1.8}
                        brightness={1.1}
                        contrast={1.1}
                        interactive={true}
                        disabled={false}
                    >
                        <div className="filter">
                            {/* НОВИЙ КОД З НУЛЯ */}
                            <div className="search-block">
                                <div 
                                    className="search-bar" 
                                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                                >
                                    <div className="search-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 490.4 490.4" fill="white">
                                            <path d="M484.1,454.796l-110.5-110.6c29.8-36.3,47.6-82.8,47.6-133.4c0-116.3-94.3-210.6-210.6-210.6S0,94.496,0,210.796
                                                s94.3,210.6,210.6,210.6c50.8,0,97.4-18,133.8-48l110.5,110.5c12.9,11.8,25,4.2,29.2,0C492.5,475.596,492.5,463.096,484.1,454.796z
                                                M41.1,210.796c0-93.6,75.9-169.5,169.5-169.5s169.6,75.9,169.6,169.5s-75.9,169.5-169.5,169.5S41.1,304.396,41.1,210.796z"/>
                                        </svg>

                                        <div className="input">
                                            <input 
                                                type="text" 
                                                placeholder="Select your area..." 
                                                value={selectedArea}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6" fill="none">
                                        <path d="M6 6L0 0H12L6 6Z" fill="white"/>
                                    </svg>
                                </div>
                                
                                {showAreaDropdown && (
                                    <div className="area-dropdown">
                                        <div className="area-title">Select your area</div>
                                        <div className="area-list">
                                            {neighborhoods.map((area, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`area-option ${selectedArea === area ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedArea(area);
                                                        setShowAreaDropdown(false);
                                                    }}
                                                >
                                                    {area}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="check-block">
                                <div className="check" >
                                    <svg onClick={() => setOpen(true)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="white">
                                        <path d="M152 64H296V24C296 10.745 306.745 0 320 0C333.255 0 344 10.745 344 24V64H384C419.346 64 448 92.654 448 128V448C448 483.346 419.346 512 384 512H64C28.654 512 0 483.346 0 448V128C0 92.654 28.654 64 64 64H104V24C104 10.745 114.745 0 128 0C141.255 0 152 10.745 152 24V64ZM48 448C48 456.837 55.163 464 64 464H384C392.837 464 400 456.837 400 448V192H48V448Z"/>
                                    </svg>

                                    <div className="checks" onClick={() => setOpen(true)}>
                                        <span>{value[0] && value[0].$D ? value[0].$D + ' ' + getMonthName(value[0].$M) + ' ' : 'Check in'}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"
                                             fill="none">
                                            <path
                                                d="M11.3536 4.35355C11.5488 4.15829 11.5488 3.84171 11.3536 3.64645L8.17157 0.464466C7.97631 0.269204 7.65973 0.269204 7.46447 0.464466C7.2692 0.659728 7.2692 0.976311 7.46447 1.17157L10.2929 4L7.46447 6.82843C7.2692 7.02369 7.2692 7.34027 7.46447 7.53553C7.65973 7.7308 7.97631 7.7308 8.17157 7.53553L11.3536 4.35355ZM0 4.5H11V3.5H0V4.5Z"
                                                fill="white"/>
                                        </svg>
                                        <span>{value[1] && value[1].$D ? value[1].$D + ' ' + getMonthName(value[1].$M) + ' ' : 'Check out'}</span>
                                    </div>
                                </div>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateRangePicker']}>
                                        <DateRangePicker
                                            open={open}
                                            onClose={() => setOpen(false)}
                                            value={value}
                                            onChange={handleDateChange}
                                            minDate={dayjs()}
                                            disablePast
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            <div className="guests-block">
                                <div className="guests-serach">
                                    <div onClick={() => setShowWithWhom(!showWithWhom)}
                                        className="guests">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                             viewBox="0 0 18 18" fill="none">
                                            <path
                                                d="M11.3762 6.80085C10.7408 7.4614 9.88545 7.82682 9 7.82682C8.11455 7.82682 7.25918 7.4614 6.62382 6.80085C5.98751 6.13931 5.62514 5.23606 5.62514 4.28841C5.62514 3.34076 5.98751 2.43751 6.62382 1.77597C7.25918 1.11542 8.11455 0.75 9 0.75C9.88545 0.75 10.7408 1.11542 11.3762 1.77597C12.0125 2.43751 12.3749 3.34076 12.3749 4.28841C12.3749 5.23606 12.0125 6.13931 11.3762 6.80085ZM0.75 15.1394C0.75 15.0113 0.84331 14.6944 1.21679 14.2354C1.57105 13.8 2.11546 13.3152 2.84099 12.8616C4.28855 11.9566 6.40117 11.2109 9 11.2109C11.7137 11.2109 13.8259 11.8872 15.2369 12.7461C15.9438 13.1764 16.4614 13.6441 16.7949 14.0815C17.1345 14.5268 17.25 14.8944 17.25 15.1394V17.25H0.75V15.1394Z"
                                                stroke="white" stroke-width="1.5"/>
                                        </svg>
                                        <div>{peopleAmount && peopleAmount ? peopleAmount + ' guests' : 'Add guests'}</div>
                                    </div>
                                </div>
                                
                                {showWithWhom && (
                                    <div className="guests-dropdown">
                                        <div className="guests-dropdown-title">Add guests</div>
                                        <div className="guests-dropdown-content">
                                            <div className="count-item">
                                                <span className="count-label">Guests</span>
                                                <div className="count-controls">
                                                    <svg
                                                        onClick={(e) => { e.stopPropagation(); peopleAmount > 0 && setPeopleAmount(peopleAmount - 1); }}
                                                        xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                        viewBox="0 0 32 32">
                                                        <circle cx="16" cy="16" r="15" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1"/>
                                                        <path d="M10 16L22 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                    </svg>
                                                    <span className="count-value">{peopleAmount ? peopleAmount : '0'}</span>
                                                    <svg onClick={(e) => { e.stopPropagation(); setPeopleAmount(peopleAmount + 1); }}
                                                         xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                         viewBox="0 0 32 32">
                                                        <circle cx="16" cy="16" r="15" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1"/>
                                                        <path d="M16 10L16 22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                        <path d="M10 16L22 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleSearch}
                                    className="search-button"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </AppleLiquidGlass>
                </div>
            </div>

            <div className="ideal-accommodation">
                <div className="acc-title">Find the ideal accommodation for you</div>

                <div className="accommodations">
                    <Accommondation img={acc1}/>
                    <Accommondation img={acc2}/>
                    <Accommondation img={acc3}/>
                </div>
            </div>

            <div className="info-cards">
                <div className="upper-row">
                    <div className="must-know block">
                        <div className="image">
                            <img src={infoCard1} alt=""/>
                        </div>
                        <div className="name">Lovely apartment in Downtown</div>
                        <div className="blur-cover">
                            <div className="blur-content">
                                <div>
                                    Navigate on photos to read caption
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="31" viewBox="0 0 24 31"
                                         fill="none">
                                        <path d="M12.7655 7.132L16.0875 4.61719ZM1.96875 15.3051L5.29082 12.7903Z"
                                              fill="white"/>
                                        <path d="M12.7655 7.132L16.0875 4.61719M1.96875 15.3051L5.29082 12.7903"
                                              stroke="white" stroke-linecap="round"/>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                              d="M9.00124 12.1015C8.41535 9.38961 9.33331 8.84194 11.5019 10.4979L21.502 19.4979C23.491 21.0168 24.0416 22.362 21.6321 22.9534L19.0014 23.4979L22.6937 29.1867C23.1548 29.8659 23.4535 30.2533 22.7931 30.7276C22.1329 31.2021 21.9625 30.6771 21.5014 29.9979L18.0014 24.4979L15.4087 26.6832C13.8082 28.4511 12.8136 27.356 12.3041 24.9979L9.00124 12.1015ZM21.0014 21.4756L10.5654 12.1014L14.5014 25.4979L16.5014 22.9979C16.5017 22.6914 16.675 22.4114 16.9491 22.2742L17.5014 21.9979L21.0014 21.4756Z"
                                              fill="white"/>
                                        <path d="M1 6.34375L4.77842 8.04553L1 6.34375Z" fill="white"/>
                                        <path d="M1 6.34375L4.77842 8.04553" stroke="white" stroke-linecap="round"/>
                                        <path d="M8.0625 1L8.51886 5.21659L8.0625 1Z" fill="white"/>
                                        <path d="M8.0625 1L8.51886 5.21659" stroke="white" stroke-linecap="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="consulates block">
                        <div className="image">
                            <img src={infoCard2} alt=""/>
                        </div>
                        <div className="name">Consulates</div>
                        <div className="blur-cover">
                            <div className="blur-text">
                                Nearly 100 foreign embassies are located in Abu Dhabi, the UAE's capital city, and Dubai
                                is home to around 80 consulates. Embassies and consulates are typically open Monday to
                                Friday (the UAE working week) and are closed on Saturdays and Sundays.
                            </div>
                        </div>
                    </div>
                    <div className="wifi block">
                        <div className="image">
                            <img src={infoCard3} alt=""/>
                        </div>
                        <div className="name">Wifi in Dubai</div>

                        <div className="logos">
                            <img src={virLogo} alt=""/>
                            <img src={dLogo} alt=""/>
                        </div>
                        <div className="blur-cover">
                            <div className="blur-text">
                                Navigating around the city, reading restaurant reviews and checking in with friends
                                around the world – we all need to stay connected. You will receive a free prepaid SIM
                                card from telecom operator, Du, on arrival at the airport. You can also check out the
                                competitive roaming and data packages from Etisalat, Du and Virgin Mobile. Safe public
                                Wi-Fi is available across the UAE at many top destinations. Simply sign up and surf
                                away.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lower-row">
                    <div className="food-in-dubai block">
                        <div className="image">
                            <img src={infoCard4} alt=""/>
                        </div>
                        <div className="name">Lovely apartment in Downtown</div>
                        <div className="blur-cover">
                            <div className="blur-text">
                                Dubai is an open-minded and tolerant society where people from all over the world live
                                harmoniously and respectfully. As with any destination, residents and tourists must
                                abide by the local laws. It is important to note that the moral code is stricter in the
                                United Arab Emirates than in some parts of the world. For example, it is prohibited to
                                drink alcohol in public places other than licensed hotels and their restaurants, as well
                                as in dedicated lounges. Furthermore, excessive public displays of affection are not
                                allowed. The UAE has one of the lowest crime rates in the world and is widely recognised
                                as being one of the safest places to live, work and visit.
                            </div>
                        </div>
                    </div>
                    <div className="arrival block">
                        <div className="image">
                            <img src={infoCard5} alt=""/>
                        </div>
                        <div className="name">Wifi in Dubai</div>

                        <div className="logos">
                            <img src={emiratesLogo} alt=""/>
                        </div>
                        <div className="blur-cover">
                            <div className="blur-text">
                                Most nationalities can simply get a visa on arrival at the airport but visitors should
                                check their visa requirements before arriving. Both Dubai International Airport (DXB)
                                and Dubai World Central (DWC) have a range of helpful facilities and public transport
                                options. <br/><br/> Money changing facilities and taxis are readily available, as well
                                as car rental services, convenience stores and information desks for general queries.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RoomWithRoomy/>

            <Protected/>

            <Comments/>

            <WhyLandlords/>

            <GetQuality/>

            <WorkingWithRoomy/>


            <div className="testimonials">
                <div className="images">
                    <div className="one">
                        <img src={test2} alt="" onClick={() => setComment('2')}/>
                    </div>
                    <div className="two">
                        <img src={test1} alt="" onClick={() => setComment('1')}/>
                        <img src={test3} alt="" onClick={() => setComment('3')}/>
                    </div>
                </div>

                <div className={`arrow arr ${comment === '1' ? 'active' : 'unactive'}`}>
                    <img src={arrow} alt=""/>
                </div>
                <div className={`arrow2 arr ${comment === '2' ? 'active' : 'unactive'}`}>
                    <img src={arrow} alt=""/>
                </div>
                <div className={`arrow3 arr ${comment === '3' ? 'active' : 'unactive'}`}>
                    <img src={arrow} alt=""/>
                </div>

                <div className="what-clients">
                    <div className="main-title">
                        <div className="what-our">WHAT OUR CLIENTS SAY</div>
                        <div className="what-our">TESTIMONIALS</div>
                    </div>


                    <div className="messages">
                        <span className={`${comment === '1' ? 'active' : 'unactive'}`}>Estepona is one of the tourist enclaves where the most new luxury homes are being built on the Costa del Sol. It is located 33 kilometers from Marbella and 90 kilometers from Malaga, well connected by the AP-7 and A-7 </span>
                        <span className={`${comment === '2' ? 'active' : 'unactive'}`}>Estepona is one of the tourist enclaves where the most new luxury homes are being built on the Costa del Sol. It is located 33 kilometers from Marbella and 90 kilometers from Malaga, well connected by the AP-7 and A-7 </span>
                        <span className={`${comment === '3' ? 'active' : 'unactive'}`}>Estepona is one of the tourist enclaves where the most new luxury homes are being built on the Costa del Sol. It is located 33 kilometers from Marbella and 90 kilometers from Malaga, well connected by the AP-7 and A-7 </span>
                    </div>

                    <div className="name-slide">
                        <div className="names">
                            <div className={`name ${comment === '1' ? 'active' : 'unactive'}`}>PETER LEE</div>
                            <div className={`name ${comment === '2' ? 'active' : 'unactive'}`}>PE2432TER LE2223142E
                            </div>
                            <div className={`name ${comment === '3' ? 'active' : 'unactive'}`}>123 12</div>
                        </div>


                        <div className="slide-active">
                            <div className={`${comment === '1' ? 'active' : ''}`}></div>
                            <div className={`${comment === '2' ? 'active' : ''}`}></div>
                            <div className={`${comment === '3' ? 'active' : ''}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <Footer/>
    </div>)
}

export default Home