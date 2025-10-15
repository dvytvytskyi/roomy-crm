import peopleAvaBg from "../assets/home/people-bg.png";
import phone from "../assets/home/phone.png";
import "../styles/components/roomWithMyRoomy.scss"

export default function RoomWithRoomy() {
    return <div className="room-with-roomy">
        <div className="room-title">Room With Roomy</div>

        <div className="phone-ava">
            <img className="people" src={peopleAvaBg} alt=""/>
            <div className="gradient-circle"></div>
            <img className="phone" src={phone} alt=""/>
        </div>
    </div>
}