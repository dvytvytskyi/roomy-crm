import React, { useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_ENDPOINTS, formatDateForAPI } from '../config/api.js';

const ReservationModal = ({ 
    showModal, 
    setShowModal, 
    project, 
    reservationData, 
    setReservationData,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    includeChild,
    includeDog
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReservationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate form data
        if (!reservationData.firstName.trim() || !reservationData.lastName.trim() || 
            !reservationData.email.trim() || !reservationData.phone.trim()) {
            alert('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(reservationData.email)) {
            alert('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            // First check availability
            console.log('Checking availability before creating reservation...');
            const availabilityResponse = await axios.post(API_ENDPOINTS.RESERVATIONS.CHECK_AVAILABILITY, {
                propertyId: project._id,
                checkIn: formatDateForAPI(checkIn),
                checkOut: formatDateForAPI(checkOut)
            });

            if (!availabilityResponse.data.success || !availabilityResponse.data.data.available) {
                throw new Error('These dates are no longer available. Please select different dates.');
            }

            console.log('✅ Dates are available, proceeding with reservation...');

            // Prepare reservation data for API
            const reservationPayload = {
                propertyId: project._id,
                checkIn: formatDateForAPI(checkIn),
                checkOut: formatDateForAPI(checkOut),
                numberOfGuests: guests,
                totalPrice: totalPrice,
                guestInfo: {
                    firstName: reservationData.firstName,
                    lastName: reservationData.lastName,
                    email: reservationData.email,
                    phone: reservationData.phone
                },
                notes: `Children included: ${includeChild ? 'Yes' : 'No'}, Pets included: ${includeDog ? 'Yes' : 'No'}`
            };

            console.log('Submitting reservation to API:', reservationPayload);

            // Send reservation to CRM API
            const response = await axios.post(API_ENDPOINTS.RESERVATIONS.CREATE, reservationPayload);

            if (response.data.success) {
                console.log('✅ Reservation created successfully:', response.data);
                
                const successMessage = `Reservation submitted successfully! 
                
Your reservation details:
• Reservation ID: ${response.data.data.reservationId}
• Property: ${project?.title}
• Check-in: ${checkIn?.format('MMM DD, YYYY')}
• Check-out: ${checkOut?.format('MMM DD, YYYY')}
• Guests: ${guests}
• Total: AED ${totalPrice}

You will receive a confirmation email shortly.`;
                
                alert(successMessage);
                setShowModal(false);
                setReservationData({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to create reservation');
            }
        } catch (error) {
            console.error('❌ Error submitting reservation:', error);
            
            let errorMessage = 'Error submitting reservation. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Please check your reservation details and try again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Property not found or not available.';
            } else if (error.response?.status === 409) {
                errorMessage = 'These dates are no longer available. Please select different dates.';
            }
            
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nights = checkIn && checkOut ? checkOut.diff(checkIn, 'day') : 0;
    const pricePerNight = project?.prices?.basePrice || 0;

    if (!showModal) return null;

    return (
        <div className="reservation-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reservation-modal-header">
                    <h2>Complete Your Reservation</h2>
                    <button 
                        className="close-button" 
                        onClick={() => setShowModal(false)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="reservation-modal-content">
                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-section">
                            <h3>Contact Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={reservationData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={reservationData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={reservationData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={reservationData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="reservation-summary">
                            <h3>Reservation Summary</h3>
                            <div className="summary-content">
                                <div className="property-info">
                                    <h4>{project?.title}</h4>
                                    <p>{project?.address?.city}, {project?.address?.country}</p>
                                </div>
                                
                                <div className="dates-info">
                                    <div className="date-item">
                                        <span className="label">Check-in:</span>
                                        <span className="value">{checkIn?.format('MMM DD, YYYY')}</span>
                                    </div>
                                    <div className="date-item">
                                        <span className="label">Check-out:</span>
                                        <span className="value">{checkOut?.format('MMM DD, YYYY')}</span>
                                    </div>
                                    <div className="date-item">
                                        <span className="label">Guests:</span>
                                        <span className="value">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                                    </div>
                                    {includeChild && (
                                        <div className="date-item">
                                            <span className="label">Children:</span>
                                            <span className="value">Included</span>
                                        </div>
                                    )}
                                    {includeDog && (
                                        <div className="date-item">
                                            <span className="label">Pets:</span>
                                            <span className="value">Included</span>
                                        </div>
                                    )}
                                </div>

                                <div className="price-breakdown">
                                    <div className="price-item">
                                        <span className="label">AED {pricePerNight} × {nights} nights</span>
                                        <span className="value">AED {pricePerNight * nights}</span>
                                    </div>
                                    <div className="price-total">
                                        <span className="label">Total</span>
                                        <span className="value">AED {totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="confirm-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;
