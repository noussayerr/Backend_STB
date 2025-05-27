import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyToken = async (req, res, next) => {
	let token;
	
	// Check cookies first
	if (req.cookies?.token) {
	  token = req.cookies.token;
	} 
	// Then check Authorization header
	else if (req.headers.authorization?.startsWith('Bearer ')) {
	  token = req.headers.authorization.split(' ')[1];
	}
  
	if (!token) {
	  return res.status(401).json({ 
		success: false, 
		message: "Unauthorized - no token provided" 
	  });
	}
	
	try {
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
	  if (!decoded) {
		return res.status(401).json({ 
		  success: false, 
		  message: "Unauthorized - invalid token" 
		});
	  }
	  
	  const user = await User.findById(decoded.userId).select("-password");
	  if (!user) {
		return res.status(401).json({ 
		  success: false, 
		  message: "Unauthorized - user not found" 
		});
	  }
	  req.user = user;

	  next();
	} catch (error) {
	  console.log("Error in verifyToken ", error);
	  return res.status(500).json({ 
		success: false, 
		message: "Server error during token verification" 
	  });
	}
  };