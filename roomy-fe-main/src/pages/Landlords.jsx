import React, { useState } from 'react';
import '../styles/pages/landlords.scss';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhyLandlords from '../components/WhyLandlords.jsx';

const Landlords = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        location: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('📩 Landlord form submitted:', formData);
        // TODO: Integrate with backend API
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="landlords-page">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Maximize Your Property's Potential with Roomy
                    </h1>
                    <p className="hero-subtitle">
                        We help property owners generate up to 30% more revenue through professional management, 
                        dynamic pricing, and access to our global network of quality guests.
                    </p>
                    <button className="hero-cta" onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}>
                        Get Started Today
                    </button>
                </div>
                <div className="hero-image">
                    <div className="hero-image-placeholder">
                        {/* Glass morphism card with property stats */}
                        <div className="stats-card">
                            <div className="stat">
                                <div className="stat-number">$2,500+</div>
                                <div className="stat-label">Average Monthly Income</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">95%</div>
                                <div className="stat-label">Occupancy Rate</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Support Available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Roomy Section */}
            <section className="about-section">
                <div className="about-content">
                    <div className="about-text">
                        <h2>Who is Roomy?</h2>
                        <p>
                            Roomy is your trusted partner in property management and vacation rentals. 
                            We combine cutting-edge technology with personalized service to help property 
                            owners maximize their rental income while maintaining the highest standards of guest satisfaction.
                        </p>
                        <p>
                            With years of experience in the hospitality industry, we've helped hundreds of 
                            property owners transform their investments into profitable, hassle-free revenue streams.
                        </p>
                    </div>
                    <div className="about-features">
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>Airbnb Superhosts</h3>
                            <p>Our 4.8+ rating ensures your property gets maximum visibility and bookings</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3>Dynamic Pricing</h3>
                            <p>AI-powered pricing optimization to maximize your revenue year-round</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>Full Protection</h3>
                            <p>Comprehensive insurance and guest verification for your peace of mind</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌍</div>
                            <h3>Global Reach</h3>
                            <p>Access to our network of verified guests from around the world</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Landlords Section */}
            <WhyLandlords />

            {/* Services Section */}
            <section className="services-section">
                <h2>What We Offer</h2>
                <div className="services-grid">
                    <div className="service-item">
                        <div className="service-number">01</div>
                        <h3>Professional Photography</h3>
                        <p>High-quality photos and videos that showcase your property's best features</p>
                    </div>
                    <div className="service-item">
                        <div className="service-number">02</div>
                        <h3>Listing Optimization</h3>
                        <p>SEO-optimized descriptions across multiple booking platforms</p>
                    </div>
                    <div className="service-item">
                        <div className="service-number">03</div>
                        <h3>Guest Communication</h3>
                        <p>24/7 guest support in multiple languages, handling all inquiries</p>
                    </div>
                    <div className="service-item">
                        <div className="service-number">04</div>
                        <h3>Cleaning & Maintenance</h3>
                        <p>Professional cleaning and routine maintenance after each guest</p>
                    </div>
                    <div className="service-item">
                        <div className="service-number">05</div>
                        <h3>Revenue Management</h3>
                        <p>Dynamic pricing strategy adjusted daily based on market demand</p>
                    </div>
                    <div className="service-item">
                        <div className="service-number">06</div>
                        <h3>Reporting & Analytics</h3>
                        <p>Monthly reports with detailed performance metrics and insights</p>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="contact-section" id="contact-form">
                <div className="contact-container">
                    <div className="contact-info">
                        <h2>Ready to Get Started?</h2>
                        <p>
                            Fill out the form and our team will contact you within 24 hours to discuss 
                            how we can help maximize your property's potential.
                        </p>
                        <div className="contact-details">
                            <div className="detail-item">
                                <div className="detail-icon">📧</div>
                                <div>
                                    <div className="detail-label">Email</div>
                                    <div className="detail-value">landlords@roomy.com</div>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon">📞</div>
                                <div>
                                    <div className="detail-label">Phone</div>
                                    <div className="detail-value">+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon">⏰</div>
                                <div>
                                    <div className="detail-label">Working Hours</div>
                                    <div className="detail-value">Mon-Fri: 9AM - 6PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form">
                        {submitted && (
                            <div className="success-message">
                                ✅ Thank you! We'll contact you soon.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
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
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="propertyType">Property Type *</label>
                                    <select
                                        id="propertyType"
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="villa">Villa</option>
                                        <option value="condo">Condo</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Property Location *</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="City, Country"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Tell us about your property</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Number of bedrooms, special features, your expectations..."
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landlords;

