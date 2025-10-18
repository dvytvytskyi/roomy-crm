import React, { useState, useEffect, useRef } from 'react';
import '../styles/pages/aboutUs.scss';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer.jsx';

const AboutUs = () => {
    const [counters, setCounters] = useState({
        properties: 0,
        guests: 0,
        rating: 0,
        years: 0
    });

    const observerRef = useRef(null);
    const statsRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    // Intersection Observer for scroll animations
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        const elements = document.querySelectorAll('.fade-in-element');
        elements.forEach((el) => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Counter animation for statistics
    useEffect(() => {
        const statsObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        animateCounters();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) {
            statsObserver.observe(statsRef.current);
        }

        return () => statsObserver.disconnect();
    }, [hasAnimated]);

    const animateCounters = () => {
        const targets = { properties: 50, guests: 5000, rating: 4.8, years: 4 };
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setCounters({
                properties: Math.floor(targets.properties * progress),
                guests: Math.floor(targets.guests * progress),
                rating: (targets.rating * progress).toFixed(1),
                years: Math.floor(targets.years * progress)
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setCounters(targets);
            }
        }, interval);
    };

    const values = [
        {
            icon: '🏆',
            title: 'Excellence',
            description: 'We strive for perfection in every detail, from property cleanliness to guest communication.'
        },
        {
            icon: '🤝',
            title: 'Trust',
            description: 'Building lasting relationships with guests and property owners through transparency and reliability.'
        },
        {
            icon: '💎',
            title: 'Luxury',
            description: 'Curating premium properties with hotel-grade amenities and high-end furnishings.'
        },
        {
            icon: '🌟',
            title: 'Innovation',
            description: 'Embracing technology and new approaches to enhance the short-term rental experience.'
        },
        {
            icon: '🛡️',
            title: 'Security',
            description: 'Fully licensed and insured, ensuring peace of mind for guests and property owners.'
        },
        {
            icon: '❤️',
            title: 'Hospitality',
            description: 'Treating every guest like family and going above and beyond to exceed expectations.'
        }
    ];

    return (
        <div className="about-us-page">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="floating-circle circle-1"></div>
                    <div className="floating-circle circle-2"></div>
                    <div className="floating-circle circle-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">About Us</div>
                    <h1 className="hero-title">
                        Welcome to <span className="gradient-text">Roomy</span>
                    </h1>
                    <p className="hero-subtitle">
                        Your trusted partner in premium short-term rentals across Dubai. 
                        We don't just offer places to stay—we create unforgettable experiences.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="story-section fade-in-element">
                <div className="story-content">
                    <div className="story-text">
                        <h2 className="section-title">Our Story</h2>
                        <p>
                            Founded in 2021, <strong>Roomy</strong> emerged from a simple vision: to redefine 
                            short-term rentals in Dubai by combining luxury, hospitality, and technology.
                        </p>
                        <p>
                            Our small but passionate team brings extensive experience from the travel, property, 
                            and hospitality industries. We've personally managed hundreds of stays, earning a 
                            <strong> 4.8+ rating</strong> and <strong>Superhost status</strong> on Airbnb.
                        </p>
                        <p>
                            As a <strong>licensed holiday home company</strong> registered with the Dubai Department 
                            of Tourism and Commerce Marketing, we manage a curated portfolio of properties—from 
                            stylish one-bedroom apartments to luxurious penthouses in Dubai's most exclusive neighborhoods.
                        </p>
                    </div>
                    <div className="story-image">
                        <img 
                            src="https://a0.muscache.com/im/pictures/hosting/Hosting-1504875351083285037/original/89b78754-1c3e-46c0-a231-95dc21e37492.jpeg?im_w=1200" 
                            alt="Dubai's Premium Properties" 
                            className="story-photo"
                        />
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section fade-in-element" ref={statsRef}>
                <h2 className="section-title">Our Achievements</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏠</div>
                        <div className="stat-number">{counters.properties}+</div>
                        <div className="stat-label">Premium Properties</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🌟</div>
                        <div className="stat-number">{counters.guests}+</div>
                        <div className="stat-label">Happy Guests</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-number">{counters.rating}</div>
                        <div className="stat-label">Average Rating</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-number">{counters.years}+</div>
                        <div className="stat-label">Years Experience</div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section fade-in-element">
                <h2 className="section-title">Our Values</h2>
                <p className="section-subtitle">
                    The principles that guide everything we do
                </p>
                <div className="values-grid">
                    {values.map((value, index) => (
                        <div 
                            key={index} 
                            className="value-card"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="value-icon">{value.icon}</div>
                            <h3 className="value-title">{value.title}</h3>
                            <p className="value-description">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Certification Section */}
            <section className="certification-section fade-in-element">
                <div className="certification-content">
                    <div className="certification-badge">
                        <div className="badge-icon">✅</div>
                        <div className="badge-text">
                            <h3>Officially Licensed</h3>
                            <p>Dubai Department of Tourism and Commerce Marketing</p>
                        </div>
                    </div>
                    <p className="certification-description">
                        We are a fully licensed and registered holiday home company in Dubai, ensuring 
                        compliance with all local regulations and providing you with complete peace of mind.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section fade-in-element">
                <h2 className="cta-title">Ready to Experience Roomy?</h2>
                <p className="cta-subtitle">
                    Browse our curated collection of premium properties or list your own
                </p>
                <div className="cta-buttons">
                    <button className="cta-button primary" onClick={() => window.location.href = '/properties'}>
                        Browse Properties
                    </button>
                    <button className="cta-button secondary" onClick={() => window.location.href = '/landlords'}>
                        List Your Property
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;

