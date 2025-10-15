import "../styles/pages/selection.scss"
import HeaderTwo from "../components/Header/HeaderTwo.jsx";
import FilterAreas from "../components/FilterAreas.jsx";
import projectsData from "../data/respones.json";
import PorjectCard from "../components/PorjectCard.jsx";
import {useState} from "react";
import Footer from "../components/Footer.jsx";

const Selection = () => {
    const [visibleProjects, setVisibelProjects] = useState(12)


    return (<div className="selection">
        <HeaderTwo/>

        <FilterAreas
            filterDataProjects={''}
            setFilterDataProjects={''}
        />

        <div className="sort">
            <div className="studios">
                50 studios and apartments for rent in Dubai
            </div>

            <div className="sort-gall-map">
                <div className="sort-by">
                    Sort by

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" viewBox="0 0 16 8" fill="none">
                        <path d="M1 1L7.34921 6.44218C7.7237 6.76317 8.2763 6.76317 8.65079 6.44218L15 1"
                              stroke="#717171" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>

                <div className="gallery-map">
                    <div className="gallery">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                        <g clip-path="url(#clip0_1010_2837)">
                                <path
                                    d="M3.4974 0.664062H1.16406C0.611778 0.664062 0.164062 1.11178 0.164062 1.66406V3.9974C0.164062 4.54968 0.611778 4.9974 1.16406 4.9974H3.4974C4.04968 4.9974 4.4974 4.54968 4.4974 3.9974V1.66406C4.4974 1.11178 4.04968 0.664062 3.4974 0.664062Z"
                                    fill="#717171"/>
                                <path
                                    d="M3.4974 6.32812H1.16406C0.611778 6.32812 0.164062 6.77584 0.164062 7.32812V9.66146C0.164062 10.2137 0.611778 10.6615 1.16406 10.6615H3.4974C4.04968 10.6615 4.4974 10.2137 4.4974 9.66146V7.32812C4.4974 6.77584 4.04968 6.32812 3.4974 6.32812Z"
                                    fill="#717171"/>
                                <path
                                    d="M3.4974 12H1.16406C0.611778 12 0.164062 12.4477 0.164062 13V15.3333C0.164062 15.8856 0.611778 16.3333 1.16406 16.3333H3.4974C4.04968 16.3333 4.4974 15.8856 4.4974 15.3333V13C4.4974 12.4477 4.04968 12 3.4974 12Z"
                                    fill="#717171"/>
                                <path
                                    d="M9.16927 0.664062H6.83594C6.28365 0.664062 5.83594 1.11178 5.83594 1.66406V3.9974C5.83594 4.54968 6.28365 4.9974 6.83594 4.9974H9.16927C9.72156 4.9974 10.1693 4.54968 10.1693 3.9974V1.66406C10.1693 1.11178 9.72156 0.664062 9.16927 0.664062Z"
                                    fill="#717171"/>
                                <path
                                    d="M9.16927 6.32812H6.83594C6.28365 6.32812 5.83594 6.77584 5.83594 7.32812V9.66146C5.83594 10.2137 6.28365 10.6615 6.83594 10.6615H9.16927C9.72156 10.6615 10.1693 10.2137 10.1693 9.66146V7.32812C10.1693 6.77584 9.72156 6.32812 9.16927 6.32812Z"
                                    fill="#717171"/>
                                <path
                                    d="M9.16927 12H6.83594C6.28365 12 5.83594 12.4477 5.83594 13V15.3333C5.83594 15.8856 6.28365 16.3333 6.83594 16.3333H9.16927C9.72156 16.3333 10.1693 15.8856 10.1693 15.3333V13C10.1693 12.4477 9.72156 12 9.16927 12Z"
                                    fill="#717171"/>
                                <path
                                    d="M14.8333 0.664062H12.5C11.9477 0.664062 11.5 1.11178 11.5 1.66406V3.9974C11.5 4.54968 11.9477 4.9974 12.5 4.9974H14.8333C15.3856 4.9974 15.8333 4.54968 15.8333 3.9974V1.66406C15.8333 1.11178 15.3856 0.664062 14.8333 0.664062Z"
                                    fill="#717171"/>
                                <path
                                    d="M14.8333 6.32812H12.5C11.9477 6.32812 11.5 6.77584 11.5 7.32812V9.66146C11.5 10.2137 11.9477 10.6615 12.5 10.6615H14.8333C15.3856 10.6615 15.8333 10.2137 15.8333 9.66146V7.32812C15.8333 6.77584 15.3856 6.32812 14.8333 6.32812Z"
                                    fill="#717171"/>
                                <path
                                    d="M14.8333 12H12.5C11.9477 12 11.5 12.4477 11.5 13V15.3333C11.5 15.8856 11.9477 16.3333 12.5 16.3333H14.8333C15.3856 16.3333 15.8333 15.8856 15.8333 15.3333V13C15.8333 12.4477 15.3856 12 14.8333 12Z"
                                    fill="#717171"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1010_2837">
                                    <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Gallery
                    </div>
                    <div className="map">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                            <g clip-path="url(#clip0_1010_2849)">
                                <path
                                    d="M7.9974 0.5C6.31829 0.501941 4.70851 1.16982 3.5212 2.35713C2.33389 3.54444 1.666 5.15422 1.66406 6.83333C1.66406 11.198 6.02273 15.1587 7.35806 16.2687C7.5376 16.4178 7.76366 16.4995 7.99706 16.4995C8.23047 16.4995 8.45652 16.4178 8.63606 16.2687C9.9694 15.1587 14.3307 11.1967 14.3307 6.83267C14.3286 5.15367 13.6607 3.54406 12.4734 2.3569C11.2861 1.16973 9.67639 0.501941 7.9974 0.5ZM7.9974 10.1667C7.33812 10.1667 6.69366 9.97117 6.1455 9.6049C5.59733 9.23863 5.17009 8.71803 4.9178 8.10894C4.66551 7.49986 4.59949 6.82964 4.72811 6.18303C4.85673 5.53643 5.1742 4.94249 5.64037 4.47631C6.10655 4.01014 6.70049 3.69267 7.3471 3.56405C7.9937 3.43543 8.66392 3.50144 9.27301 3.75374C9.88209 4.00603 10.4027 4.43327 10.769 4.98143C11.1352 5.5296 11.3307 6.17406 11.3307 6.83333C11.3307 7.27107 11.2445 7.70453 11.077 8.10894C10.9095 8.51336 10.6639 8.88083 10.3544 9.19036C10.0449 9.49988 9.67743 9.74542 9.27301 9.91293C8.86859 10.0804 8.43514 10.1667 7.9974 10.1667Z"
                                    fill="black" fill-opacity="0.54"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1010_2849">
                                    <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Map
                    </div>
                </div>
            </div>
        </div>

        <div className={`projects ${visibleProjects >= projectsData.length && 'bottom-p'}`}>
            {
                projectsData.slice(0, visibleProjects).map((project, index) => (
                    <PorjectCard
                        key={index}
                    />
                ))
            }
        </div>
        {
            visibleProjects <= projectsData.length && <div className="show">
                <div className="show-more" onClick={() => setVisibelProjects(visibleProjects + 8)}>Show more</div>
            </div>
        }

        <Footer/>
    </div>)
}

export default Selection