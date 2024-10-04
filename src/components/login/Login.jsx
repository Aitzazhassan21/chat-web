// import { useState } from "react";
// import "./login.css";
// import { toast } from "react-toastify";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { auth, db } from "../../lib/firebase";
// import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
// import upload from "../../lib/upload";

// const Login = () => {
//   const [avatar, setAvatar] = useState({
//     file: null,
//     url: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleAvatar = (e) => {
//     if (e.target.files[0]) {
//       setAvatar({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0]),
//       });
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData(e.target);
//       const { username, email, password } = Object.fromEntries(formData);

//       // VALIDATE INPUTS
//       if (!username || !email || !password) {
//         toast.warn("Please enter all inputs!");
//         setLoading(false);
//         return;
//       }
//       if (!avatar.file) {
//         toast.warn("Please upload an avatar!");
//         setLoading(false);
//         return;
//       }

//       // VALIDATE UNIQUE USERNAME
//       const usersRef = collection(db, "users");
//       const q = query(usersRef, where("username", "==", username));
//       const querySnapshot = await getDocs(q);
//       if (!querySnapshot.empty) {
//         toast.warn("Select another username");
//         setLoading(false);
//         return;
//       }

//       // CREATE USER AND UPLOAD AVATAR
//       const res = await createUserWithEmailAndPassword(auth, email, password);
//       const imgUrl = await upload(avatar.file);

//       await setDoc(doc(db, "users", res.user.uid), {
//         username,
//         email,
//         avatar: imgUrl,
//         id: res.user.uid,
//         blocked: [],
//       });

//       await setDoc(doc(db, "userchats", res.user.uid), {
//         chats: [],
//       });

//       toast.success("Account created! You can login now!");
//     } catch (err) {
//       console.log("Error during registration:", err);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.target);
//     const { email, password } = Object.fromEntries(formData);

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//     } catch (err) {
//       console.log(err);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login">
//       <div className="item">
//         <h2>Welcome back,</h2>
//         <form onSubmit={handleLogin}>
//           <input type="text" placeholder="Email" name="email" />
//           <input type="password" placeholder="Password" name="password" />
//           <button className="loginbtn" disabled={loading}>
//             {loading ? "Loading" : "Sign In"}
//           </button>
//         </form>
//       </div>
//       <div className="separator"></div>
//       <div className="item">
//         <h2>Create an Account</h2>
//         <form onSubmit={handleRegister}>
//           <label htmlFor="file">
//             <img src={avatar.url || "./avatar.png"} alt="" />
//             Upload an image
//           </label>
//           <input
//             type="file"
//             id="file"
//             style={{ display: "none" }}
//             onChange={handleAvatar}
//           />
//           <input type="text" placeholder="Username" name="username" />
//           <input type="text" placeholder="Email" name="email" />
//           <input type="password" placeholder="Password" name="password" />
//           <button className="signupbtn" disabled={loading}>
//             {loading ? "Loading" : "Sign Up"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const { username, email, password } = Object.fromEntries(formData);

      if (!username || !email || !password) {
        toast.warn("Please enter all inputs!");
        setLoading(false);
        return;
      }

      if (!avatar.file) {
        toast.warn("Please upload an avatar!");
        setLoading(false);
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.warn("Select another username");
        setLoading(false);
        return;
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Delay for 1 second to let the toast message show
  
    } catch (err) {
      console.log("Error during registration:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      setTimeout(() => {
        window.location.reload();
      }, 100); // Delay for 1 second to let the toast message show
  
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
   
      <div className="item">
        {isLogin ? (
          <>
            <h2>  <img src="./logo.png" alt=""  className="logo"/>Welcome Back</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Email" name="email" />
              <input type="password" placeholder="Password" name="password" />
              <button className="loginbtn" disabled={loading}>
                {loading ? "Loading" : "Sign In"}
              </button>
            </form>
            <a
              href="#!"
              className="link"
              onClick={() => setIsLogin(false)}
            >
              Don't have an account? Sign Up
            </a>
          </>
        ) : (
          <>
            <h2 >   <img src="./logo.png" alt=""  className="logo"/>Create an Account</h2>
            <form onSubmit={handleRegister}>
              <label htmlFor="file">
                <img src={avatar.url || "./avatar.png"} alt="" />
                Upload an image
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
              <input type="text" placeholder="Username" name="username" />
              <input type="text" placeholder="Email" name="email" />
              <input type="password" placeholder="Password" name="password" />
              <button className="signupbtn" disabled={loading}>
                {loading ? "Loading" : "Sign Up"}
              </button>
            </form>
            <a
              href="#!"
              className="link"
              onClick={() => setIsLogin(true)}
            >
              Already have an account? Sign In
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
