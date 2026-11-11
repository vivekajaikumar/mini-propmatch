
import { Route, Routes } from "react-router-dom";

import Home from "./Home";
import { Navbar } from "./components/Navbar";
import { PropertyDetails } from "./pages/PropertyDetails";
import { NewProperty } from "./pages/NewProperty";
import { EditProperty } from "./pages/EditProperty";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route
                path="/login"
                element={
                    <>
                        <Navbar />
                        <Login />
                    </>
                }
            />

            <Route
                path="/signup"
                element={
                    <>
                        <Navbar />
                        <Signup />
                    </>
                }
            />

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
