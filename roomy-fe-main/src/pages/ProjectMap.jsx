import "../styles/pages/projectMap.scss"
import HeaderTwo from "../components/Header/HeaderTwo.jsx";
import FilterAreas from "../components/FilterAreas.jsx";
import projectsData from "../data/respones.json";
import PorjectCard from "../components/PorjectCard.jsx";
import Map from "../components/Map.jsx"
import React, {useState} from "react";
import ReactPaginate from "react-paginate";


const ProjectMap = () => {
    const itemsPerPage = 8
    const [itemOffset, setItemOffset] = useState(0);

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = projectsData.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(projectsData.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % projectsData.length;
        console.log(
            `User requested page number ${event.selected}, which is offset ${newOffset}`
        );
        setItemOffset(newOffset);
    };


    return (<div className="project-map">
        <HeaderTwo/>

        <FilterAreas
            filterDataProjects={''}
            setFilterDataProjects={''}
        />

        <div className="projects-map">
            <div className="projects-pag">
                <div className="projects">
                    {
                        currentItems.slice(0, 20).map((project, index) => (
                            <PorjectCard
                                project={project}
                                key={index}
                            />
                        ))
                    }

                </div>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel={<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"
                                    fill="none">
                        <g clip-path="url(#clip0_972_3830)">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M2.61719 9.12009L6.80981 4.99628L2.61719 0.87247L3.26481 0.234375L8.09338 4.99866L3.26481 9.75818L2.61719 9.12009Z"
                                  fill="black"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_972_3830">
                                <rect width="10" height="10" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>}
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    pageCount={pageCount}
                    previousLabel={<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"
                                        fill="none">
                        <g clip-path="url(#clip0_972_3828)">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M7.38281 0.87991L3.19019 5.00372L7.38281 9.12753L6.73519 9.76562L1.90662 5.00134L6.73519 0.241816L7.38281 0.87991Z"
                                  fill="black"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_972_3828">
                                <rect width="10" height="10" fill="white" transform="translate(10 10) rotate(-180)"/>
                            </clipPath>
                        </defs>
                    </svg>}
                    renderOnZeroPageCount={null}
                />
            </div>


            <div className="map">
                <Map/>
            </div>
        </div>



    </div>)
}

export default ProjectMap