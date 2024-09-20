import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const RoomPage = () => {
  const { roomId } = useParams();

  useEffect(() => {
    const myMeeting = async (element) => {
      const appId = 1615935499;
      const serverSecret = "28cf83311b42db7b38ab4eed22c8cc41";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        Date.now().toString(),
        "Hassan"
      );
      const zc = ZegoUIKitPrebuilt.create(kitToken);
      
      zc.joinRoom({
        container: element,
        sharedLinks: [
          { name: "Copy Link", url: `http://localhost:3000/room/${roomId}` },
        ],
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      });
    };

    const container = document.getElementById('meeting-container');
    if (container) myMeeting(container);
  }, [roomId]);

  return <div id="meeting-container" style={{ width: "100%", height: "600px" }} />;
};

export default RoomPage;
