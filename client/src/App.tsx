
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import { PropertyDetails } from "./pages/PropertyDetails";
import { NewProperty } from "./pages/NewProperty";
import { EditProperty } from "./pages/EditProperty";
import { Navbar } from "./components/Navbar";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route
                path="/properties/new"
                element={
                    <>
                        <Navbar />
                        <NewProperty />
                    </>
                }
            />

            <Route
                path="/properties/:id/edit"
                element={
                    <>
                        <Navbar />
                        <EditProperty />
                    </>
                }
            />

            <Route
                path="/properties/:id"
                element={
                    <>
                        <Navbar />
                        <PropertyDetails />
                    </>
                }
            />
        </Routes>
    );
}

export default App;
