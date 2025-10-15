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
import {Link} from "react-router-dom";


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
    const [comment, setComment] = useState('1')
    const [value, setValue] = React.useState([dayjs(null), dayjs(null)]);
    const [open, setOpen] = useState(false);
    const [showWithWhom, setShowWithWhom] = useState(false)
    const [peopleAmount, setPeopleAmount] = useState(null)
    const [petsAmount, setPetsAmount] = useState(null)
    const [daysDifference , setDaysDiffrence] = useState();

    const getMonthName = (num) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[num - 1] || "Invalid month number";
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

    useEffect(() => {
        const interval = setInterval(() => {
            const element = document.querySelector('div[style="position: absolute; pointer-events: none; color: rgba(130, 130, 130, 0.62); z-index: 100000; width: 100%; text-align: center; bottom: 50%; right: 0px; letter-spacing: 5px; font-size: 24px;"]');

            if (element) {
                element.style.display = 'none';
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

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
                            <div className="search-block">
                                <div className="search-bar">
                                    <div className="search-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                             viewBox="0 0 20 20"
                                             fill="none">
                                            <circle cx="8.49988" cy="8.49988" r="7.49988" stroke="#0D0C22"
                                                    stroke-width="2"/>
                                            <path d="M14 14L18.9999 18.9999" stroke="#0D0C22" stroke-width="2"
                                                  stroke-linecap="round"/>
                                        </svg>

                                        <div className="input">
                                            <input type="text" placeholder="Select your area..."/>
                                        </div>
                                    </div>

                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6"
                                         fill="none">
                                        <path d="M6 6L0 0H12L6 6Z" fill="#0D0C22"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="check-block">
                                <div className="check" >
                                    <svg onClick={() => setOpen(true)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                         fill="none">
                                        <path
                                            d="M1 7H19M5 1V3M15 1V3M4 11H6M4 15H6M9 11H11M9 15H11M14 11H16M14 15H16M4.2 19H15.8C16.9201 19 17.4802 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.4802 19 16.9201 19 15.8V6.2C19 5.07989 19 4.51984 18.782 4.09202C18.5903 3.71569 18.2843 3.40973 17.908 3.21799C17.4802 3 16.9201 3 15.8 3H4.2C3.0799 3 2.51984 3 2.09202 3.21799C1.71569 3.40973 1.40973 3.71569 1.21799 4.09202C1 4.51984 1 5.07989 1 6.2V15.8C1 16.9201 1 17.4802 1.21799 17.908C1.40973 18.2843 1.71569 18.5903 2.09202 18.782C2.51984 19 3.07989 19 4.2 19Z"
                                            stroke="#0D0C22" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"/>
                                    </svg>

                                    <div className="checks" onClick={() => setOpen(true)}>
                                        <span>{value[0] && value[0].$D ? value[0].$D + ' ' + getMonthName(value[0].$M) + ' ' : 'Check in'}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"
                                             fill="none">
                                            <path
                                                d="M11.3536 4.35355C11.5488 4.15829 11.5488 3.84171 11.3536 3.64645L8.17157 0.464466C7.97631 0.269204 7.65973 0.269204 7.46447 0.464466C7.2692 0.659728 7.2692 0.976311 7.46447 1.17157L10.2929 4L7.46447 6.82843C7.2692 7.02369 7.2692 7.34027 7.46447 7.53553C7.65973 7.7308 7.97631 7.7308 8.17157 7.53553L11.3536 4.35355ZM0 4.5H11V3.5H0V4.5Z"
                                                fill="#0D0C22"/>
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
                                        className={`guests ${showWithWhom ? 'active' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                             viewBox="0 0 18 18" fill="none">
                                            <path
                                                d="M11.3762 6.80085C10.7408 7.4614 9.88545 7.82682 9 7.82682C8.11455 7.82682 7.25918 7.4614 6.62382 6.80085C5.98751 6.13931 5.62514 5.23606 5.62514 4.28841C5.62514 3.34076 5.98751 2.43751 6.62382 1.77597C7.25918 1.11542 8.11455 0.75 9 0.75C9.88545 0.75 10.7408 1.11542 11.3762 1.77597C12.0125 2.43751 12.3749 3.34076 12.3749 4.28841C12.3749 5.23606 12.0125 6.13931 11.3762 6.80085ZM0.75 15.1394C0.75 15.0113 0.84331 14.6944 1.21679 14.2354C1.57105 13.8 2.11546 13.3152 2.84099 12.8616C4.28855 11.9566 6.40117 11.2109 9 11.2109C11.7137 11.2109 13.8259 11.8872 15.2369 12.7461C15.9438 13.1764 16.4614 13.6441 16.7949 14.0815C17.1345 14.5268 17.25 14.8944 17.25 15.1394V17.25H0.75V15.1394Z"
                                                stroke="#0D0C22" stroke-width="1.5"/>
                                        </svg>
                                        <div>{peopleAmount && peopleAmount ? peopleAmount + ' guests' : 'Add guests'}</div>

                                        <div className={`people-pets ${showWithWhom ? 'active' : ''}`}>
                                            <div className="count">
                                                Guests
                                                <div>
                                                    <svg
                                                        onClick={(event) => { event.stopPropagation(); peopleAmount > 0 && setPeopleAmount(peopleAmount - 1); }}
                                                        xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                        viewBox="0 0 32 32"
                                                        fill="none">
                                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5"
                                                              stroke="#F1F1F1"/>
                                                        <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2"
                                                              stroke-linecap="round"/>
                                                    </svg>
                                                    {peopleAmount ? peopleAmount : '0'}
                                                    <svg onClick={(event) => { event.stopPropagation(); setPeopleAmount(peopleAmount + 1); }}
                                                         xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                         viewBox="0 0 32 32"
                                                         fill="none">
                                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5"
                                                              stroke="#F1F1F1"/>
                                                        <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2"
                                                              stroke-linecap="round"/>
                                                        <path d="M16.25 10.75L16.25 21.25" stroke="#F1F1F1"
                                                              stroke-width="2"
                                                              stroke-linecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="count">
                                                Pets
                                                <div>
                                                    <svg onClick={(event) => { event.stopPropagation(); petsAmount > 0 && setPetsAmount(petsAmount - 1); }}
                                                         xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                         viewBox="0 0 32 32"
                                                         fill="none">
                                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5"
                                                              stroke="#F1F1F1"/>
                                                        <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2"
                                                              stroke-linecap="round"/>
                                                    </svg>
                                                    {petsAmount ? petsAmount : '0'}
                                                    <svg onClick={(event) => { event.stopPropagation(); setPetsAmount(petsAmount + 1); }}
                                                         xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                                         viewBox="0 0 32 32"
                                                         fill="none">
                                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5"
                                                              stroke="#F1F1F1"/>
                                                        <path d="M11 16H21.5" stroke="#F1F1F1" stroke-width="2"
                                                              stroke-linecap="round"/>
                                                        <path d="M16.25 10.75L16.25 21.25" stroke="#F1F1F1"
                                                              stroke-width="2"
                                                              stroke-linecap="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/properties" state={{
                                            value: value,
                                            peopleAmountHome: peopleAmount,
                                            daysDifference: daysDifference
                                        }}
                                          className="search-button">
                                        Search
                                    </Link>
                                </div>
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