import React, { useEffect, useRef, useState } from 'react';
import '../styles/pages/contactUs.scss';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer.jsx';

const ContactUs = () => {
    const observerRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-element');
        elements.forEach((el) => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // TODO: Add actual form submission logic
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="contact-us-page">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="floating-circle circle-1"></div>
                    <div className="floating-circle circle-2"></div>
                    <div className="floating-circle circle-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">Contact Us</div>
                    <h1 className="hero-title">
                        Let&apos;s <span className="gradient-text">Connect</span>
                    </h1>
                    <p className="hero-subtitle">
                        Have questions about our properties or services? We&apos;re here to help! 
                        Reach out and let&apos;s make your Dubai experience extraordinary.
                    </p>
                </div>
            </section>

            {/* Contact Info & Form Section */}
            <section className="contact-main-section fade-in-element">
                <div className="contact-container">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <h2 className="section-title">Get In Touch</h2>
                        <p className="section-description">
                            Whether you&apos;re a property owner looking to maximize your rental income 
                            or a guest seeking the perfect Dubai accommodation, we&apos;re just a message away.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="method-icon">📧</div>
                                <div className="method-details">
                                    <h3>Email Us</h3>
                                    <a href="mailto:info@roomy.ae">info@roomy.ae</a>
                                    <p>We typically respond within 24 hours</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">📱</div>
                                <div className="method-details">
                                    <h3>Call or WhatsApp</h3>
                                    <a href="tel:+971563490731">+971 56 349 0731</a>
                                    <p>Available 9 AM - 8 PM (GST)</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">📍</div>
                                <div className="method-details">
                                    <h3>Location</h3>
                                    <p>Dubai, United Arab Emirates</p>
                                    <p>Serving all major areas</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">🕒</div>
                                <div className="method-details">
                                    <h3>Business Hours</h3>
                                    <p>Sunday - Saturday</p>
                                    <p>9:00 AM - 8:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-container">
                        <div className="form-header">
                            <h2>Send Us a Message</h2>
                            <p>Fill out the form below and we&apos;ll get back to you as soon as possible</p>
                        </div>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+971 50 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="property-inquiry">Property Inquiry</option>
                                    <option value="list-property">List My Property</option>
                                    <option value="booking">Booking Assistance</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us how we can help you..."
                                    rows="6"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">
                                Send Message
                                <span className="button-icon">✉️</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="quick-links-section fade-in-element">
                <h2 className="section-title">Quick Links</h2>
                <div className="quick-links-grid">
                    <div className="quick-link-card">
                        <div className="link-icon">🏠</div>
                        <h3>Browse Properties</h3>
                        <p>Explore our curated collection of premium Dubai properties</p>
                        <a href="/properties" className="link-button">View Properties</a>
                    </div>

                    <div className="quick-link-card">
                        <div className="link-icon">💼</div>
                        <h3>For Property Owners</h3>
                        <p>Learn how we can maximize your rental income</p>
                        <a href="/landlords" className="link-button">Learn More</a>
                    </div>

                    <div className="quick-link-card">
                        <div className="link-icon">ℹ️</div>
                        <h3>About Roomy</h3>
                        <p>Discover our story and what makes us different</p>
                        <a href="/about-us" className="link-button">About Us</a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactUs;

