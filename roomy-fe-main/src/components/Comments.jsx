import {Swiper, SwiperSlide} from "swiper/react";
import "../styles/components/comments.scss"
import {Autoplay, Navigation, Pagination} from "swiper/modules";

// Star component for rating
function Star({ filled }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path
                d="M7.32463 2.65559C7.2986 2.57781 7.23122 2.52115 7.15017 2.50868L4.99822 2.17986L4.03404 0.125795C3.99794 0.0490054 3.92072 0 3.83595 0C3.75118 0 3.67407 0.0490054 3.63786 0.125795L2.67368 2.17986L0.521732 2.50879C0.440682 2.52115 0.373413 2.57792 0.347271 2.6557C0.321239 2.73336 0.340818 2.81912 0.398133 2.87786L1.96161 4.48115L1.59213 6.74589C1.57856 6.82859 1.61346 6.91183 1.68204 6.95996C1.71966 6.98655 1.76374 7 1.80793 7C1.84425 7 1.88078 6.99081 1.91381 6.97265L3.83584 5.90952L5.75787 6.97265C5.7909 6.99081 5.82743 7 5.86375 7C5.90794 7 5.95213 6.98655 5.98964 6.95996C6.05823 6.91183 6.09312 6.82859 6.07956 6.74589L5.71007 4.48115L7.27355 2.87786C7.33097 2.81901 7.35066 2.73325 7.32463 2.65559Z"
                fill={filled ? "#FAD637" : "#E3E3E3"}/>
        </svg>
    );
}

function Comment({ data }) {
    return <div className="comment">
        <div className="title-part">
            <div className="user">
                <img src={data.avatar} alt={data.name}/>

                <div className="name-reviews">
                    <div className="name">{data.name}</div>
                    <div className="reviews">{data.reviews} reviews</div>
                </div>
            </div>

            <div className="stars-time">
                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} filled={star <= data.rating} />
                    ))}
                </div>
                <div>{data.timeAgo}</div>
            </div>
        </div>

        <div className="comment-text">
            {data.text}
        </div>
    </div>;
}

export default function Comments() {
    const reviewsData = [
        {
            name: "Emma Johnson",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 127,
            rating: 5,
            timeAgo: "1 week ago",
            text: "Amazing experience with Roomy! The apartment was exactly as described and the location was perfect. The team was very responsive and helpful throughout our stay. Highly recommended!"
        },
        {
            name: "Michael Chen",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 89,
            rating: 4,
            timeAgo: "2 weeks ago",
            text: "Great service and beautiful property. The check-in process was smooth and the place was spotless. Would definitely book again for future trips to Dubai."
        },
        {
            name: "Sarah Williams",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 203,
            rating: 5,
            timeAgo: "3 days ago",
            text: "Outstanding hospitality! The apartment had everything we needed and more. The view was breathtaking and the amenities were top-notch. Thank you Roomy team!"
        },
        {
            name: "David Rodriguez",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 156,
            rating: 5,
            timeAgo: "1 month ago",
            text: "Perfect stay from start to finish. The communication was excellent, the property exceeded expectations, and the location was ideal. Couldn't ask for more!"
        },
        {
            name: "Lisa Thompson",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 78,
            rating: 4,
            timeAgo: "5 days ago",
            text: "Beautiful apartment with modern amenities. The team was professional and accommodating. The area was safe and had great restaurants nearby. Highly satisfied!"
        },
        {
            name: "James Anderson",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 234,
            rating: 5,
            timeAgo: "2 weeks ago",
            text: "Exceptional service and beautiful accommodation. The apartment was spacious, clean, and had stunning city views. The Roomy team made our stay memorable."
        },
        {
            name: "Maria Garcia",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format",
            reviews: 167,
            rating: 5,
            timeAgo: "1 week ago",
            text: "Fantastic experience! The property was immaculate and the location was perfect for exploring Dubai. The team's attention to detail and customer service was outstanding."
        }
    ];

    return <div className="commnets">
        <Swiper slidesPerView={4}
                spaceBetween={21}
                loop={"true"}
                autoplay={{
                    delay: 2300,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
        >
            {reviewsData.map((review, index) => (
                <SwiperSlide key={index}>
                    <Comment data={review}/>
                </SwiperSlide>
            ))}
        </Swiper>
    </div>;
}