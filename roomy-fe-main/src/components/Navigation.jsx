import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ variant = 'default' }) => {
    const navItems = [
        { label: 'Our Homes', href: '/properties' },
        { label: 'Landlords', href: '/landlords' },
        { label: 'About Us', href: '/about-us' },
        { label: 'Contact Us', href: '/contact-us' }
    ];

    if (variant === 'simple') {
        return (
            <div className="active-link">
                {navItems.map((item, index) => (
                    <div key={index}>
                        <Link to={item.href}>{item.label}</Link>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <nav>
            <ul>
                {navItems.map((item, index) => (
                    <Link key={index} to={item.href}>
                        <li>{item.label}</li>
                    </Link>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
