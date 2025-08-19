/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React base styles
import colors from "assets/theme-dark/base/colors";
import borders from "assets/theme-dark/base/borders";

// Material Dashboard 2 React helper functions
import pxToRem from "assets/theme-dark/functions/pxToRem";

const { background } = colors;
const { borderRadius } = borders;

const sidenav = {
  styleOverrides: {
    root: {
      width: pxToRem(250),
      whiteSpace: "nowrap",
      border: "none",
    },

    paper: {
      width: pxToRem(280),
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      height: "100vh",
      margin: 0,
      borderRadius: 0,
      border: "none",
      boxShadow: "0 0 40px rgba(0,0,0,0.3)",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
      borderRight: "1px solid rgba(255,255,255,0.05)",

      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "radial-gradient(circle at 20% 80%, rgba(119, 175, 10, 0.1) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), " +
          "radial-gradient(circle at 40% 40%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)",
        pointerEvents: "none",
      },

      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(119, 175, 10, 0.2), transparent)",
      },

      // Animation d'entrée
      animation: "slideInLeft 0.6s ease-out",
    },

    paperAnchorDockedLeft: {
      borderRight: "none",
    },
  },
};

export default sidenav;
