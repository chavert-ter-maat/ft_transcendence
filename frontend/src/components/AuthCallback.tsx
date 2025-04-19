import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopUpModal from "./PopUpModal/PopUpModal";

const urlParams = new URLSearchParams(window.location.search);

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, content: "", isError: false });

  useEffect(() => {

    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setModal({ show: true, content: "Authentication failed. Please try again.", isError: true });
      console.log("Authentication failed. Please try again.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }


    console.log("rerender: " + token);
    if (token) {
      setModal({ show: true, content: "Authentication successful. Redirecting to user page...", isError: false });
      localStorage.setItem("authToken", token);
      console.log("Authentication successful. Redirecting to user page...");
      setTimeout(() => navigate("/userpage"), 3000);
    } else {
      setModal({ show: true, content: "No authentication token received", isError: true });
      console.log('No authentication token received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);


  return (
    <div>
      {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
    </div>
  );
};

export default AuthCallback;
