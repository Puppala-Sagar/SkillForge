
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Optional for token decoding
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { addBadges, getBadges } from "./contentService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const [isAuthenticated, setIsAuthenticated] = useState(
    token ? true : false
  );
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState(
    Array.from({ length: 29 }, (_, i) => ({
      id: i + 1,
      count: 0,
    }))
  );

  const navigate = useNavigate();
  const location = useLocation();
//   console.log(location.pathname);

  const fetchBadges = async (email) => {
    // console.log(email);
    await getBadges(email).then((res) => {
      // console.log(res);
      if(res) {
        setBadges(res.badges);
      }
    })
  }

  useEffect(() => {
    // console.log("yes");
    const checkValidity = async (token) => {
      try {
        const response = await axios.get("http://localhost:3000/api/validateJWT", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log(response);

        // console.log(isAuthenticated);

        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUser({
          name: decodedToken.name,
          email: decodedToken.email,
        });
        await fetchBadges(decodedToken.email);
      } catch (error) { 
        // console.error(error);
        logout();
      }
    }

    const token = localStorage.getItem("token");
    if (token) checkValidity(token);

    if(isAuthenticated && !token) logout();
  
  }, [location.pathname]);

  const logout = async () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser({
      name: "",
      email: "",
    });
    await addBadges(user.email, badges);
    // window.location.href = "/login";
    navigate("/login");
  }; 

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const res = await axios.get(`http://localhost:3000/api/streak?userId=${parsedUser.userId}`);
          setStreak(res.data.streak || 0);
        } catch (error) {
          console.error("Error fetching streak:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const updateStreak = async (userId) => {
    try {
      const res = await axios.post("http://localhost:3000/api/update-streak", { userId });
      setStreak(res.data.streak);
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };


  const addBadge = async (id) => {
    // console.log(id);
    setBadges((prevBadges) => {
      const updatedBadges = prevBadges.map((badge) =>
        badge.id === id ? { ...badge, count: badge.count + 1 } : badge
      );
      // console.log(updatedBadges); 
      if(user.email) addBadges(user.email, updatedBadges);
      return updatedBadges;
    });
    
    // setBadges(badges.map((badge) => badge.id == id ? { id, count: badge.count + 1 } : badge));
    // console.log(badges);
  }

  

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, logout, badges, addBadge, setBadges,user, setUser, streak, setStreak, updateStreak }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
