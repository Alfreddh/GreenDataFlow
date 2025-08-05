import React from "react";
import { Box } from "@mui/material";
import FormHeader from "./formHeader";

export default function FormBuilder() {
  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "50vh" }}>
      <FormHeader />
    </Box>
  );
}
