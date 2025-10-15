import img1 from "../../assets/ProjectPage/gall1.png";
import "../../styles/components/modal.scss"
import {useState} from "react";

const Modal = ({showModal, setShowModal}) => {
    const modalRooms = [
        "Living room",
        "Kitchen",
        "Bedroom 1",
        "Bedroom 2",
        "Bathroom",
        "Gym",
        "Exterior",
        "Pool",
        "Special features"
    ]
    const [currentRoom, setCurrentRoon] = useState(modalRooms[0])


    return (<div className={`modal ${showModal && 'active'}`}>
        <div className="modal-header">
            <div className="modal-nav">
                {
                    modalRooms.map((room, index) => (
                        <div
                            className={currentRoom === room && 'active'}
                            key={index}
                            onClick={() => setCurrentRoon(room)}
                        >
                            {room}
                        </div>
                    ))
                }
            </div>

            <svg id="back" onClick={() => setShowModal(false)} xmlns="http://www.w3.org/2000/svg" width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M8 2L1.70711 8.29289C1.31658 8.68342 1.31658 9.31658 1.70711 9.70711L8 16" stroke="black"
                      stroke-width="2.5" stroke-linecap="round"/>
            </svg>
        </div>

        <div className="photos-container">
            <div className="photos-title">{currentRoom}</div>

            <div className="photos">
                <img className="div1" src={img1} alt=""/>
                <img className="div2" src={img1} alt=""/>
                <img className="div3" src={img1} alt=""/>
                <img className="div4" src={img1} alt=""/>
            </div>
        </div>
    </div>)
}

export default Modal