import React, {useEffect} from "react";
import "../styles/components/filterAreas.scss"
import {useTranslation} from "react-i18next";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';


const FilterProjects = ({filterDataProjects, setFilterDataProjects}) => {
    const { t } = useTranslation();

    const typeOptions = ["Apartment", "Villa", "Penthouse", "Room"]
    const bedroomOptions = ["1", "2", "3", "4", "5"];
    const ameneties = ["1", "2", "3", "4", "5"];

    const handleSearchChange = (value) => {
        setFilterDataProjects(prevState => ({
            ...prevState,
            search: value
        }));
    }

    const handleItemChange = (propertyName, selectedItem) => {
        setFilterDataProjects(prevState => {
            const existingItems = prevState[propertyName];

            const itemExists = existingItems.includes(selectedItem);

            const updatedItems = itemExists
                ? existingItems.filter(item => item !== selectedItem)
                : [...existingItems, selectedItem];

            return {
                ...prevState,
                [propertyName]: updatedItems
            };
        });
    }

    const handleFromToChange = (type, field, value) => {
        setFilterDataProjects(prevState => ({
            ...prevState,
            [type]: {
                ...prevState[type],
                [field]: value
            }
        }));
    }

    const resetFilter = () => {
        setFilterDataProjects({
            search: "",
            priceValues: { from: "", to: "" },
            sizeValues: { from: "", to: "" },
            bedrooms: [],
            location: [],
            propertyType: [],
            status: [],
            areas: []
        })
    }

    return (<div className="filter-areas">
            <div className="types-row">
                <div className="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <g clip-path="url(#clip0_4477_16641)">
                            <circle cx="9.58268" cy="9.58317" r="7.91667" stroke="black" stroke-width="1.5"/>
                            <path d="M15.416 15.4165L18.3327 18.3332" stroke="black" stroke-width="1.5"
                                  stroke-linecap="round"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_4477_16641">
                                <rect width="20" height="20" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                    <input type="text" placeholder='Search property'/>
                </div>
                <div className="type">
                    Type
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z"
                            fill="#AAAAAA"/>
                    </svg>
                    <div className="menu">
                        {typeOptions.map((option, index) => (
                            <div key={index} className={`option`}
                                 onClick={() => handleItemChange("propertyType", option)}>
                                {option}

                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"
                                     fill="none">
                                    <circle cx="5" cy="5" r="4.5" stroke="#717171"/>
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="type">
                    Beds
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z"
                            fill="#AAAAAA"/>
                    </svg>
                    <div className="menu">
                        {bedroomOptions.map((option, index) => (
                            <div key={index} className={`option`}
                                 onClick={() => handleItemChange("bedrooms", option)}>
                                {option}

                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"
                                     fill="none">
                                    <circle cx="5" cy="5" r="4.5" stroke="#717171"/>
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="type">
                    Price
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z"
                            fill="#AAAAAA"/>
                    </svg>
                    <div className='price-menu'>
                        <input
                            placeholder={t('from')}
                        />
                        <input
                            placeholder={t("to")}
                        />
                    </div>
                </div>
                <div className="type">
                    Amenities
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z"
                            fill="#AAAAAA"/>
                    </svg>
                    <div className="menu">
                        {ameneties.map((option, index) => (
                            <div key={index} className={`option`}
                                 onClick={() => handleItemChange("areas", option)}>
                                {option}

                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"
                                     fill="none">
                                    <circle cx="5" cy="5" r="4.5" stroke="#717171"/>
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="reset" onClick={() => resetFilter()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
                        <path
                            d="M7.76036 7.32205C7.50153 7.06322 7.08186 7.06322 6.82303 7.32205C6.5642 7.5809 6.5642 8.00055 6.82303 8.25937L8.56366 10L6.82305 11.7407C6.56422 11.9995 6.56422 12.4191 6.82305 12.678C7.08188 12.9368 7.50154 12.9368 7.76036 12.678L9.50102 10.9374L11.2416 12.678C11.5004 12.9368 11.9201 12.9368 12.179 12.678C12.4378 12.4191 12.4378 11.9995 12.179 11.7406L10.4383 10L12.179 8.25937C12.4378 8.00057 12.4378 7.58091 12.179 7.32208C11.9201 7.06324 11.5004 7.06324 11.2416 7.32208L9.50102 9.06267L7.76036 7.32205Z"
                            fill="#FF5959"/>
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="M9.5 0.5C4.2533 0.5 0 4.7533 0 10C0 15.2467 4.2533 19.5 9.5 19.5C14.7467 19.5 19 15.2467 19 10C19 4.7533 14.7467 0.5 9.5 0.5ZM1.32558 10C1.32558 5.4854 4.9854 1.82558 9.5 1.82558C14.0146 1.82558 17.6744 5.4854 17.6744 10C17.6744 14.5146 14.0146 18.1744 9.5 18.1744C4.9854 18.1744 1.32558 14.5146 1.32558 10Z"
                              fill="#FF5959"/>
                    </svg>

                    Сlear
                </div>
            </div>
        </div>
    )
}

export default FilterProjects