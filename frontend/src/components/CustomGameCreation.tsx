import React from "react";

interface CustomGameProps {
  userId: string;
}

const CustomGameCreation: React.FC<CustomGameProps> = ({ userId }) => {
  return <div className="customgame"></div>;
};

export default CustomGameCreation;
