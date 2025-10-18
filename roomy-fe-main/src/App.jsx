import './App.css'
import './styles/components/appleLiquidGlass.scss'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Properties from "./pages/Properties.jsx";
import Selection from "../src/pages/Selection.jsx"
import ProjectMap from "./pages/ProjectMap.jsx";
import MapPage from "./pages/MapPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import Lease from "./pages/Lease.jsx";
import Test from "./pages/Test.jsx";
import Landlords from "./pages/Landlords.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";


function App() {
  return (
      <BrowserRouter>
    <Routes >
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/landlords" element={<Landlords />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/selection" element={<Selection />} />
      <Route path="/project-map" element={<ProjectMap />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/project" element={<ProjectPage />} /> {/* Fallback for old links */}
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/lease" element={<Lease />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  </BrowserRouter>

  )
}

export default App
