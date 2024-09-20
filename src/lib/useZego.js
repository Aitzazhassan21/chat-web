import { useRef, useState, useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";

const useZego = (appID, serverSecret) => {
  const [userInfo, setUserInfo] = useState({ userName: "", userId: "" });
  const zeroCloudInstance = useRef(null);

  useEffect(() => {
    const init = async () => {
      const userId = randomID(5);
      const userName = "user_" + userId;
      setUserInfo({ userName, userId });

      const KitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        null,
        userId,
        userName
      );

      zeroCloudInstance.current = ZegoUIKitPrebuilt.create(KitToken);
      zeroCloudInstance.current.addPlugins({ ZIM });
    };

    init();
  }, [appID, serverSecret]);

  const handleSend = (callType, callee) => {
    if (!callee) {
      alert("userID cannot be empty!!");
      return;
    }

    zeroCloudInstance.current
      .sendCallInvitation({
        callees: [{ userID: callee, userName: "user_" + callee }],
        callType: callType,
        timeout: 60,
      })
      .then((res) => {
        if (res.errorInvitees.length) {
          alert("The user does not exist or is offline.");
        } else {
          console.log("Call invitation sent successfully:", res);
        }
      })
      .catch((err) => {
        console.error("Failed to send call invitation:", err);
        alert("Failed to send call. Please try again later.");
      });
  };

  return {
    userInfo,
    handleSend,
  };
};

const randomID = (len) => {
  let result = "";
  const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
};

export default useZego;
