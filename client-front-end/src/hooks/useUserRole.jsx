// src/hooks/useUserRole.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const useUserRole = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role || "user";
            setRole(userRole);
          } else {
            setRole("user");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole("user");
        }
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return role;
};

export default useUserRole;
