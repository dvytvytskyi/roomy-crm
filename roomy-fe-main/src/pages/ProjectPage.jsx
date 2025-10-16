import "../styles/pages/projectPage.scss"
import "../styles/components/datePicker.scss"
import "../styles/components/reservationModal.scss"
import Header from "../components/Header/Header.jsx";
import {useEffect, useState} from "react";
import projectsData from "../data/respones.json";
import Map from "../components/Map.jsx"
import Footer from "../components/Footer.jsx";
import Modal from "../components/Project/Modal.jsx";
import ReservationModal from "../components/ReservationModal.jsx";
import {useLocation, useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_ENDPOINTS, formatDateForAPI } from "../config/api.js";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";

const ProjectPage = () => {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Loading state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [visibleAmenities, setVisibelAmenities] = useState(7)
    
    // Default values with fallback
    
    const [guestAmount, setGuestAmount] = useState(null) // No default selection
    const [includeChild, setIncludeChild] = useState(false)
    const [includeDog, setIncludeDog] = useState(false)
    
    // Date picker modal state
    const [showModal, setShowModal] = useState(false)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const [project, setProject] = useState(null)
    
    // Reservation form data
    const [reservationData, setReservationData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    })
    
    // Generate dynamic guest count based on property capacity
    const maxGuests = project?.accommodates || 4; // Fallback to 4 if not available
    const guestCount = Array.from({ length: maxGuests }, (_, index) => index + 1);
    const [avaibleProjectDatas, setAvaibleProjectDatas] = useState()
    
    // Handle location.state with fallback - only use dates if they were selected in filters
    let initialDates = [null, null]; // Start with empty dates
    let hasDatesFromFilters = false;
    
    if (location.state?.data?.value && Array.isArray(location.state.data.value)) {
        try {
            const parsedDates = location.state.data.value.map(obj => {
                if (obj && obj.$d) {
                    return dayjs(obj.$d);
                }
                return null;
            }).filter(date => date !== null);
            
            // Only use dates if we have exactly 2 valid dates from filters
            if (parsedDates.length === 2) {
                initialDates = parsedDates;
                hasDatesFromFilters = true;
            }
        } catch (error) {
            console.warn('Error parsing dates from location.state:', error);
        }
    }
    
    let dataValueDayjs = hasDatesFromFilters ? initialDates : [null, null];
    const [datesSelected, setDatesSelected] = useState(hasDatesFromFilters)
    const [serachDay, setSearchDay] = useState(initialDates[0])
    const [serachFinalDay, setSearchFinalDay] = useState(initialDates[1])

    const [data, setData] =  useState({
        "value": dataValueDayjs,
        "guest": location.state?.data?.guest || null,
        "pets": null,
        "neigh": null
    })
    
    
    // Debug logging
    console.log('ProjectPage calendar state:', {
        hasDatesFromFilters,
        initialDates,
        dataValueDayjs,
        datesSelected,
        locationState: location.state?.data
    })
    
    // Fetch property details from API
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get property ID from URL params or location.state
                const propertyId = id || location.state?.project?._id;
                
                console.log('🏠 ProjectPage: Loading property with ID:', propertyId);
                console.log('🏠 ProjectPage: URL params id:', id);
                console.log('🏠 ProjectPage: location.state.project:', location.state?.project);
                
                if (!propertyId) {
                    console.error('❌ ProjectPage: Property ID not found');
                    setError('Property ID not found');
                    setLoading(false);
                    return;
                }
                
                // Always fetch fresh data from API first
                const apiUrl = API_ENDPOINTS.PROPERTIES.DETAILS(propertyId);
                console.log('🏠 ProjectPage: Fetching from API:', apiUrl);
                
                const response = await axios.get(apiUrl);
                
                if (response.data.success) {
                    console.log('✅ ProjectPage: Successfully loaded property:', response.data.data.title);
                    console.log('💰 ProjectPage: Property data:', response.data.data);
                    console.log('💰 ProjectPage: Price data:', {
                        pricePerNight: response.data.data.pricePerNight,
                        prices: response.data.data.prices,
                        basePrice: response.data.data.prices?.basePrice
                    });
                    setProject(response.data.data);
                } else {
                    console.error('❌ ProjectPage: API returned error:', response.data.message);
                    // Fallback to location.state if API fails
                    if (location.state?.project) {
                        console.log('🔄 ProjectPage: Using fallback data from location.state');
                        setProject(location.state.project);
                    } else {
                        setError('Failed to load property');
                    }
                }
            } catch (error) {
                console.error('❌ ProjectPage: Error fetching property:', error);
                if (error.response?.status === 404) {
                    console.error('❌ ProjectPage: Property not found (404)');
                    // Try fallback to location.state if available
                    if (location.state?.project) {
                        console.log('🔄 ProjectPage: Using fallback data from location.state after 404');
                        setProject(location.state.project);
                        return; // Don't set error if we have fallback data
                    }
                    setError('Property not found. It may have been removed or is not available.');
                } else if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
                    console.error('❌ ProjectPage: Network error - backend might be down');
                    // Try fallback to location.state if available
                    if (location.state?.project) {
                        console.log('🔄 ProjectPage: Using fallback data from location.state after network error');
                        setProject(location.state.project);
                        return; // Don't set error if we have fallback data
                    }
                    setError('Cannot connect to server. Please try again later.');
                } else {
                    setError('Failed to load property. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchPropertyDetails();
    }, [id, location.state])

    useEffect(() => {
        if (data.value !== null && data.value[0] && data.value[1]) {
            setDatesSelected(true)
        } else {
            setDatesSelected(false)
        }
    }, [data.value])

    // Update guest amount when project loads, but only if user explicitly selected guests
    useEffect(() => {
        if (project?.accommodates && location.state?.data?.guest) {
            const maxGuests = project.accommodates;
            const currentGuest = location.state.data.guest;
            const validGuestAmount = Math.min(currentGuest, maxGuests);
            
            setGuestAmount(validGuestAmount);
            setData(prevData => ({ ...prevData, guest: validGuestAmount }));
        }
    }, [project, location.state?.data?.guest])



    // Fetch property availability from API
    useEffect(() => {
        if (!project || !project._id) return;
        
        const fetchPropertyAvailability = async () => {
            try {
                // Format dates for API (3 months ahead)
                const startDate = formatDateForAPI(dayjs());
                const endDate = formatDateForAPI(dayjs().add(3, 'month'));
                
                // Use our new API endpoint
                const url = `${API_ENDPOINTS.PROPERTIES.AVAILABILITY(project._id)}?startDate=${startDate}&endDate=${endDate}`;
                
                console.log('Fetching property availability from:', url);
                
                const response = await axios.get(url);
                
                if (response.data.success) {
                    setAvaibleProjectDatas(response.data);
                } else {
                    console.error('Failed to fetch availability:', response.data.message);
                    setAvaibleProjectDatas(null);
                }
            } catch (error) {
                console.error('Error fetching property availability:', error);
                setAvaibleProjectDatas(null);
            }
        };
        
        fetchPropertyAvailability();
    }, [project]);

    const handleGuestAmount = (amount) => {
        // Ensure guest amount doesn't exceed property capacity
        const maxGuests = project?.accommodates || 4;
        const validAmount = Math.min(amount, maxGuests);
        setGuestAmount(validAmount)
        setData({ ...data, guest: validAmount })
    }


    function calculateTotalPrice() {
        // If we have dates selected, calculate based on price per night and number of nights
        if (data.value && data.value[0] && data.value[1] && project?.prices?.basePrice) {
            const nights = data.value[1].diff(data.value[0], 'day');
            const pricePerNight = parseInt(project.prices.basePrice) || 0;
            return pricePerNight * nights;
        }
        
        // Fallback to API data if available
        let totalPrice = 0;
        if (avaibleProjectDatas?.data?.days && Array.isArray(avaibleProjectDatas.data.days)) {
            avaibleProjectDatas.data.days.forEach(priceData => {
                if (priceData && priceData.price) {
                    totalPrice += parseInt(priceData.price) || 0;
                }
            });
        }
        return totalPrice;
    }
    
    const totalPrice = calculateTotalPrice()
    const nights = data.value && data.value[0] && data.value[1] ? data.value[1].diff(data.value[0], 'day') : 0;
    console.log('Total price calculation:', { totalPrice, nights, basePrice: project?.prices?.basePrice })

    // Loading state
    if (loading) {
        return (
            <div className="project-page">
                <Header/>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #F88559',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ fontSize: '18px', color: '#666' }}>Loading property...</p>
                </div>
                <Footer/>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="project-page">
                <Header/>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <p style={{ fontSize: '18px', color: '#e74c3c' }}>❌ {error}</p>
                    <button 
                        onClick={() => navigate('/properties')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#F88559',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Properties
                    </button>
                </div>
                <Footer/>
            </div>
        );
    }

    // No property found
    if (!project) {
        return (
            <div className="project-page">
                <Header/>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh'
                }}>
                    <p style={{ fontSize: '18px', color: '#666' }}>Property not found</p>
                </div>
                <Footer/>
            </div>
        );
    }

    return <div className="project-page">
        <Header/>

        <div className="gallery">
            <div className="photos">
                <div className="div1"><img src={project.pictures?.[0]?.large || project.picture?.large || '/placeholder-image.svg'} alt=""/></div>
                <div className="div2"><img src={project.pictures?.[2]?.large || project.picture?.large || '/placeholder-image.svg'} alt=""/></div>
                <div className="div3"><img src={project.pictures?.[3]?.large || project.picture?.large || '/placeholder-image.svg'} alt=""/></div>
                <div className="more-photos" onClick={() => setShowModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2H14V14H2V2Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6H10V10H6V6Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 10L6 6L10 10L14 6" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {project?.pictures?.length > 3 && (
                        <span className="photo-count">+{project.pictures.length - 3}</span>
                    )}
                </div>
            </div>
        </div>

        <div className="project-info">
            <div className="info">
                <div className="name-description">
                    <div className="name-guests">
                        <div className="name">{project.title}</div>
                        <div className="guests">{project.accommodates || 1} guests | {project.beds === 0 ? 'Studio' : project.beds + ' bedrooms'} | {project.bathrooms} bathrooms</div>
                    </div>
                    <div className="available">
                        <div className="block">
                            <div>Available parking</div>
                            <div>There is access to a free parking in the building or nearby. Contact us before moving
                                in to the apartment
                            </div>
                        </div>
                        <div className="block">
                            <div>Highly recommended</div>
                            <div>Overall rating of the property is 4.9 - all visitors were more than happy with their
                                choice!
                            </div>
                        </div>
                    </div>
                    <div className="description">
                        <div className="info-title">Description</div>
                        <div className="description-text">
                            <div>{project.publicDescription.summary}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ameneties">
                    <div className="info-title">In this property you will have</div>
                    <div className="ameneties-container">
                        {
                            project.amenities.slice(0, visibleAmenities).map((amenit, index) => (
                                <div className="amenit" key={index}>
                                    {amenit}
                                </div>
                            ))
                        }
                    </div>
                    {
                        visibleAmenities <= projectsData.length
                        && <div className="show-all-amenities"
                                onClick={() => setVisibelAmenities(visibleAmenities.length)}>Show all amenities</div>
                    }
                </div>

            </div>

            <div className="select-dates">
                <div className="select-form">
                            <div className="price-section">
                                <div className="price-amount">
                                    AED {project?.prices?.basePrice || 0}
                                </div>
                                <div className="price-label">average per night</div>
                            </div>

                            <div className="dates-selection">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateRangePicker
                                        value={data.value}
                                        onChange={(newValue) => {
                                            setData(prev => ({
                                                ...prev,
                                                value: newValue
                                            }));
                                            if (newValue && newValue[0]) {
                                                setSearchDay(newValue[0]);
                                            }
                                            if (newValue && newValue[1]) {
                                                setSearchFinalDay(newValue[1]);
                                            }
                                        }}
                                        minDate={dayjs()}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        fontFamily: 'Onest',
                                                        '& fieldset': {
                                                            borderColor: '#F1F1F1',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#ddd',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#F88559',
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </div>

                            <div className="guests">
                                <div className="title">Guests</div>

                                <div className="guests-child">
                                    <div className="guests-count">
                                        {
                                            guestCount.map((guest, index) => (
                                                <div className={guestAmount === guest && 'active'} key={index}
                                                     onClick={() => handleGuestAmount(guest)}>
                                                    {guest}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="dog-child">
                                        <div className={`dog ${includeDog && 'active'}`}
                                             onClick={() => setIncludeDog(!includeDog)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23"
                                                 viewBox="0 0 23 23"
                                                 fill="none">
                                                <path
                                                    d="M17.3996 7.55006L14.8744 3.90236C14.6873 3.63257 14.4385 3.41126 14.1488 3.25678C13.859 3.10231 13.5366 3.0191 13.2083 3.01406L8.41613 2.94531H8.40625C5.93215 2.94531 4.03388 3.35914 2.81129 5.3788C1.67305 7.25877 1.1875 10.4612 1.1875 16.0867V16.7742H2.75831L1.74713 21.9304H3.14834L4.15952 16.7742H4.625C5.74785 16.7842 6.82958 16.3522 7.63659 15.5714C8.36616 14.8733 8.8924 13.9183 9.1585 12.8096L9.16091 12.7996L10.3401 7.14916H8.93545L7.81917 12.4983C7.4792 13.9025 6.4626 15.3992 4.625 15.3992H2.56508C2.60242 10.5323 3.04555 7.64678 3.98756 6.09067C4.77818 4.78442 5.93383 4.32074 8.40148 4.3201L13.1885 4.38885C13.298 4.39051 13.4055 4.41824 13.502 4.46974C13.5986 4.52123 13.6815 4.59501 13.7439 4.68495L16.6004 8.81076L20.4375 9.45031V10.179L19.7976 13.5916C19.6088 14.5989 19.2859 15.1062 17.9621 15.2653L12.5349 16.1938L12.499 21.9304H13.874L13.9026 17.3545L18.1437 16.6284C19.1044 16.5102 19.8133 16.2006 20.3104 15.6821C20.7354 15.2387 20.994 14.6723 21.1491 13.8451L21.8125 10.3068V8.28551L17.3996 7.55006Z"
                                                    fill="black"/>
                                            </svg>
                                        </div>
                                        <div className={`child ${includeChild && 'active'}`}
                                             onClick={() => setIncludeChild(!includeChild)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"
                                                 viewBox="0 0 25 25"
                                                 fill="none">
                                                <g clipPath="url(#clip0_972_4655)">
                                                    <path
                                                        d="M14.8142 12.7653C15.1162 12.9994 15.4988 13.1392 15.9096 13.1392C16.3177 13.1392 16.6983 13.0015 16.9995 12.7704C17.3007 12.5394 17.5267 12.2151 17.6342 11.8389C17.7044 11.592 17.5612 11.3344 17.3143 11.2643C17.0674 11.1937 16.8106 11.3369 16.7403 11.5838H16.74C16.6891 11.7633 16.5799 11.9203 16.434 12.0319C16.2875 12.1435 16.1087 12.209 15.9096 12.209C15.7094 12.209 15.5296 12.1425 15.3827 12.0296C15.2365 11.9166 15.1273 11.7572 15.0774 11.576C15.0089 11.3284 14.7532 11.1832 14.5055 11.2511C14.2582 11.3196 14.1127 11.5757 14.1809 11.823C14.286 12.2032 14.512 12.5316 14.8142 12.7653Z"
                                                        fill="white"/>
                                                    <path
                                                        d="M10.8138 11.8389C10.8844 11.5922 10.7416 11.3348 10.4947 11.2642C10.2477 11.1937 9.99058 11.3365 9.92003 11.5834C9.86847 11.7633 9.75958 11.9203 9.6137 12.0319C9.46717 12.1435 9.28839 12.209 9.08927 12.209C8.88949 12.209 8.70902 12.1425 8.56244 12.0296C8.41591 11.9166 8.30697 11.7572 8.25714 11.576C8.18861 11.3284 7.93286 11.1832 7.68522 11.2511C7.43758 11.3196 7.29241 11.5757 7.36056 11.823C7.46575 12.2033 7.69131 12.5316 7.99394 12.7654C8.29581 12.9994 8.67878 13.1392 9.08927 13.1392C9.49769 13.1392 9.87799 13.0015 10.1788 12.7705C10.4804 12.5394 10.7066 12.2151 10.8138 11.8389Z"
                                                        fill="white"/>
                                                    <path
                                                        d="M23.6563 10.3186C23.1852 9.84677 22.5447 9.53739 21.8368 9.4855C21.3944 7.40537 20.2811 5.57359 18.7349 4.22819C17.0452 2.75866 14.8335 1.86719 12.4186 1.86719C10.0074 1.86719 7.79839 2.75594 6.11009 4.22106C4.55478 5.57078 3.43634 7.41213 2.99652 9.50275C2.3547 9.58656 1.7772 9.88403 1.34267 10.3186C0.823297 10.838 0.5 11.5619 0.5 12.355C0.5 13.1467 0.823297 13.8706 1.34263 14.3899C1.86195 14.9093 2.58584 15.2322 3.37864 15.2322C3.4333 15.2322 3.48655 15.2309 3.5398 15.2282C4.23317 16.8755 5.36989 18.29 6.80244 19.3209C7.46084 19.7951 8.18375 20.1883 8.95409 20.4858C8.86114 20.1605 8.81328 19.8189 8.81328 19.4709C8.81328 19.3104 8.82383 19.1496 8.84488 18.9929C8.39914 18.7802 7.97544 18.5282 7.57789 18.2425C6.21491 17.2618 5.16022 15.8764 4.59036 14.2651L4.38444 13.6833L3.78945 13.8468C3.65239 13.8838 3.51706 13.9038 3.37864 13.9038C2.94852 13.9038 2.5647 13.7312 2.28294 13.4496C2.00141 13.1677 1.82853 12.7841 1.82853 12.355C1.82853 11.9245 2.00136 11.5405 2.28294 11.2589C2.56466 10.9774 2.94852 10.8047 3.37864 10.8047C3.40545 10.8047 3.44511 10.8074 3.50113 10.8112L4.11884 10.859L4.21044 10.2484C4.51062 8.25273 5.52289 6.49014 6.98019 5.2255C7.3445 4.90966 7.73633 4.62508 8.1515 4.37538C8.18745 4.60066 8.24277 4.81164 8.32006 5.00533C8.44255 5.31302 8.61416 5.57964 8.81769 5.80727C9.17422 6.20655 9.62028 6.48775 10.0864 6.71809C10.7859 7.06169 11.5416 7.29986 12.1767 7.59667C12.4942 7.74391 12.7802 7.90399 13.0146 8.08853C13.2493 8.27411 13.4325 8.47966 13.5631 8.73002C13.6333 8.86534 13.7734 8.94812 13.9261 8.9447C14.0788 8.941 14.2148 8.8518 14.2785 8.713C14.9675 7.22045 15.2162 6.04605 15.2162 5.12369C15.2172 4.49411 15.0981 3.98491 14.9315 3.58398C16.0232 3.93067 17.0174 4.4958 17.8635 5.23061C19.3221 6.49961 20.3316 8.26628 20.6292 10.2667L20.7279 10.9255L21.3866 10.8247C21.4741 10.8111 21.5511 10.8047 21.6217 10.8047C22.0518 10.8047 22.4345 10.9773 22.7174 11.2589C22.9993 11.5405 23.1702 11.9245 23.1719 12.3549C23.1702 12.784 22.9993 13.1677 22.7174 13.4496C22.4345 13.7311 22.0519 13.9038 21.6217 13.9038C21.4432 13.9038 21.2733 13.8715 21.1085 13.8149L20.4788 13.5927L20.2597 14.2223C19.6966 15.8445 18.643 17.2407 17.2776 18.2289C16.9204 18.4877 16.5418 18.7191 16.1446 18.9185C16.1724 19.1004 16.1856 19.2839 16.1856 19.4708C16.1856 19.7938 16.1446 20.1099 16.0649 20.4142C16.7759 20.1221 17.4439 19.7486 18.0561 19.3049C19.4816 18.2727 20.6132 16.8605 21.3028 15.2136C21.4063 15.2254 21.5138 15.2322 21.6217 15.2322C22.4145 15.2322 23.1374 14.9093 23.6564 14.3899C24.176 13.8706 24.5 13.1467 24.5 12.355C24.5 11.5619 24.176 10.838 23.6563 10.3186ZM10.8894 6.20791C10.3117 5.96439 9.80455 5.69233 9.46091 5.32966C9.28794 5.14783 9.15219 4.94462 9.05553 4.69872C8.9758 4.49416 8.92494 4.25533 8.90933 3.9738C9.43072 3.72986 9.98159 3.53753 10.556 3.40591C10.5587 3.85713 10.6635 4.56334 11.1123 5.41206C11.3127 5.79269 11.5821 6.20041 11.939 6.62781C11.5824 6.48405 11.2252 6.35008 10.8894 6.20791ZM13.938 7.45628C12.8168 6.55464 12.1788 5.72491 11.8172 5.03997C11.424 4.29438 11.3534 3.71805 11.3528 3.38425C11.3528 3.33944 11.3541 3.30011 11.3562 3.26453C11.7042 3.22009 12.0583 3.19567 12.4187 3.19567C12.9068 3.19567 13.3844 3.23941 13.8485 3.3198C13.8966 3.37539 13.9468 3.43919 13.9963 3.51414C14.2063 3.83238 14.4177 4.33202 14.4193 5.12373C14.4197 5.72181 14.2938 6.48986 13.938 7.45628Z"
                                                        fill="white"/>
                                                    <path
                                                        d="M12.4982 16.5859C11.7031 16.5856 10.9761 16.9106 10.4554 17.4323C9.9337 17.9527 9.60905 18.6797 9.60938 19.4751C9.609 20.2706 9.93366 20.9975 10.4554 21.5179C10.9761 22.0396 11.7031 22.3643 12.4982 22.3639C13.294 22.3642 14.0206 22.0396 14.5414 21.5179C15.0631 20.9975 15.3877 20.2706 15.3874 19.4751C15.3877 18.6796 15.0631 17.9527 14.5414 17.4323C14.0206 16.9105 13.294 16.5856 12.4982 16.5859ZM13.8422 20.0426C13.7323 20.3031 13.546 20.5274 13.3133 20.6847C13.0796 20.8421 12.8028 20.9331 12.4982 20.9334C12.295 20.933 12.105 20.8923 11.931 20.8188C11.6701 20.7088 11.4463 20.5229 11.2889 20.2899C11.1315 20.0562 11.0405 19.7794 11.0402 19.4751C11.0402 19.2715 11.0809 19.0816 11.1545 18.9076C11.2648 18.647 11.4503 18.4228 11.6834 18.2654C11.9171 18.108 12.1939 18.0171 12.4981 18.0168C12.7017 18.0172 12.8917 18.0578 13.0657 18.1311C13.3265 18.2414 13.5508 18.4273 13.7081 18.6603C13.8655 18.8937 13.9561 19.1708 13.9565 19.4751C13.9565 19.6783 13.9158 19.8683 13.8422 20.0426Z"
                                                        fill="white"/>
                                                    <path
                                                        d="M12.499 14.8516C10.537 14.8516 8.94531 15.8027 8.94531 16.9768C8.94531 17.3275 9.08781 17.6586 9.33986 17.9507C9.49248 17.6983 9.67877 17.4619 9.89242 17.2479C10.5872 16.5521 11.5132 16.1681 12.4976 16.1681C13.4858 16.1681 14.4105 16.5521 15.1063 17.2496C15.3203 17.4619 15.5048 17.6984 15.6579 17.9508C15.9099 17.6587 16.0524 17.3276 16.0524 16.9768C16.0523 15.8027 14.4621 14.8516 12.499 14.8516Z"
                                                        fill="white"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_972_4655">
                                                        <rect width="24" height="24" fill="white"
                                                              transform="translate(0.5 0.117188)"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="price-calculation">
                                <div className="calculation-line"></div>
                                <div className="calculation-details">
                                    <div className="calculation-item">
                                        <span className="calculation-text">
                                            AED {project?.prices?.basePrice || 0} × {data.value && data.value[0] && data.value[1] ? data.value[1].diff(data.value[0], 'day') : 0} nights
                                        </span>
                                        <span className="calculation-result">
                                            AED {data.value && data.value[0] && data.value[1] ? (project?.prices?.basePrice || 0) * data.value[1].diff(data.value[0], 'day') : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="reserve-section">
                            <button className="reserve-now-button" onClick={() => {
                                console.log('Reserve now clicked with data:', {
                                    propertyId: project._id,
                                    checkIn: serachDay?.format('YYYY-MM-DD'),
                                    checkOut: serachFinalDay?.format('YYYY-MM-DD'),
                                    guests: guestAmount,
                                    totalPrice: totalPrice,
                                    includeChild: includeChild,
                                    includeDog: includeDog
                                });
                                setShowReservationModal(true);
                            }}>
                                Reserve now
                            </button>
                            <div className="charged-text">You won&apos;t be charged now</div>
                            </div>
                        </div>

                       
            </div>
        </div>

        <div className="about-map">
                <div className="map">
                    <Map/>
            </div>
        </div>

        <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            project={project}
        />
        
        <ReservationModal
            showModal={showReservationModal}
            setShowModal={setShowReservationModal}
            project={project}
            reservationData={reservationData}
            setReservationData={setReservationData}
            checkIn={serachDay}
            checkOut={serachFinalDay}
            guests={guestAmount}
            totalPrice={totalPrice}
            includeChild={includeChild}
            includeDog={includeDog}
        />
        
        <Footer/>
    </div>
}

export default ProjectPage