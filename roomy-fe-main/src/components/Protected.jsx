import protec1 from "../assets/home/protec1.jfif";
import protec2 from "../assets/home/protec2.jfif";
import protec3 from "../assets/home/protec3.jfif";
import "../styles/components/protected.scss"

export default function Protected() {
    return <div className="protected">
        <div className="card">
            <img src={protec1} alt=""/>

            YOU ARE PROTECTED
        </div>
        <div className="card">
            <img src={protec2} alt=""/>

            ROOMY IS WORLDWIDE
        </div>
        <div className="card">
            <img src={protec3} alt=""/>

            ONLY POSITIVE FEEDBACK
        </div>
    </div>;
}