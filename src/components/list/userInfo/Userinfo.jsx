import "./userInfo.css"
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {

  const { currentUser } = useUserStore();

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2 style={{fontFamily:"sans-serif", fontWeight:"bold"}} >{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./logo.png" alt="" />
        
      </div>
    </div>
  )
}

export default Userinfo