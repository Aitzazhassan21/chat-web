import { useState } from "react";
import ChatList from "./chatList/ChatList";
import "./list.css";
import Userinfo from "./userInfo/Userinfo";

const List = ({ onChatSelect }) => {
  return (
    <div className="list">
      <Userinfo />
      <ChatList onChatSelect={onChatSelect} />
    </div>
  );
};

export default List;
