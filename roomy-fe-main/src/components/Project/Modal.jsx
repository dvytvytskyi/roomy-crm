import "../../styles/components/modal.scss"
import { useEffect } from "react"

const Modal = ({showModal, setShowModal, project}) => {
    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                setShowModal(false);
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showModal, setShowModal]);


    return (<div className={`modal ${showModal && 'active'}`} onClick={(e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    }}>
        <div className="modal-header">
            <div className="modal-nav">
                <div className="active">All Photos</div>
            </div>

            <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <div className="photos-container">

            <div className="photos">
                {project?.pictures?.length > 0 ? (
                    project.pictures.map((picture, index) => (
                        <img 
                            key={index} 
                            src={picture?.large || picture?.medium || '/placeholder-image.svg'} 
                            alt={`Photo ${index + 1}`}
                        />
                    ))
                ) : (
                    // Fallback if no pictures
                    <img src="/placeholder-image.svg" alt="No photos available"/>
                )}
            </div>
        </div>
    </div>)
}

export default Modal