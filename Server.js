const express = require("express");
const connectDB = require("./utils/Db");
const app = express();
const cors = require("cors");
require("dotenv").config();
const userRoute = require("./Routes/userRoute");
const errorHandler = require("./Middleware/errormiddleware");
const ProductRoute = require("./Routes/productRoute");
const contactRoute = require("./Routes/contactroute");
const path = require("path");

app.use(
  cors({
    origin: "*",
  })
);
connectDB();

app.use(express.json()); //Used to parse JSON bodies
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes Middlewares
app.use("/api/users", userRoute);
app.use("/api/product", ProductRoute);
app.use("/api/contactus", contactRoute);

//Routes
app.get("/", (req, res) => {
  res.send("Home page!");
});

// 404 not found error
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
