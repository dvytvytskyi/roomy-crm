import world from "../assets/home/countries.png";
import "../styles/components/whyLandlords.scss"

export default function WhyLandlords() {
    return <div className="why-landlords">
        <img id="world" src={world} alt=""/>

        <div className="main-title">
            <div>Why landlords</div>
            <div>get maximum of their homes with us</div>
        </div>

        <div className="reach-our">
            <div className="reach-title">Reach our unique global customer base</div>

            <div className="blocks">
                <div className="block">
                    <div>4.8</div>
                    <div>we are airbnb Superhosts, which helps us to
                        keep the highest possible level
                    </div>
                </div>
                <div className="block">
                    <div>2/3</div>
                    <div>of vacation rental guests return to book
                        with us again
                    </div>
                </div>
                <div className="block">
                    <div>97%</div>
                    <div>we are airbnb Superhosts, which helps us to
                        keep the highest possible level
                    </div>
                </div>
            </div>
        </div>
    </div>;
}