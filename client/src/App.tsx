import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function Menu() {
  return <h1>Menu</h1>;
}

function Shop() {
  return <h1>Shop</h1>;
}

function About() {
  return <h1>About</h1>;
}


function Login() {
  return <h1>Login</h1>;
}

function Register() {
  return <h1>Register</h1>;
}

function Cart() {
  return <h1>Cart</h1>;
}


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;