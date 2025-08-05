import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password);
      navigate("/verify-account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonTextFieldStyle = {
    mb: 1,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.85rem",
    },
    "& .MuiInputLabel-root": {
      textTransform: "uppercase",
      fontSize: "0.65rem",
      letterSpacing: "0.02em",
      "&.Mui-focused, &.MuiFormLabel-filled": {
        fontSize: "0.6rem",
      },
    },
  };

  const commonInputProps = {
    sx: {
      "& input": {
        padding: "0.7rem 0.9rem",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1668024966086-bd66ba04262f?q=80&w=892&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "700px",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: "40%",
            p: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          <img
            src="/logo_greencollect.png"
            alt="Logo"
            style={{
              width: "200%",
              maxWidth: "500px",
              height: "auto",
            }}
          />
        </Box>

        {/* Formulaire */}
        <Box
          sx={{
            width: "60%",
            p: 4,
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            sx={{
              mb: 1,
              fontWeight: "bold",
              textAlign: "left",
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Inscription
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Créez votre compte pour commencer
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="first_name"
              label="Prénom"
              autoFocus
              value={formData.first_name}
              onChange={handleChange}
              disabled={loading}
              sx={commonTextFieldStyle}
              InputProps={commonInputProps}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="last_name"
              label="Nom"
              value={formData.last_name}
              onChange={handleChange}
              disabled={loading}
              sx={commonTextFieldStyle}
              InputProps={commonInputProps}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Adresse email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              sx={commonTextFieldStyle}
              InputProps={commonInputProps}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              sx={commonTextFieldStyle}
              InputProps={commonInputProps}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              sx={{
                ...commonTextFieldStyle,
                mb: 3,
              }}
              InputProps={commonInputProps}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                backgroundColor: "#77af0a",
                "&:hover": {
                  backgroundColor: "#689c09",
                },
                fontSize: "1rem",
                color: "#ffffff",
                fontWeight: "400",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              disabled={loading}
            >
              {loading ? "INSCRIPTION EN COURS..." : "S'INSCRIRE"}
            </Button>

            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 2 }}>
                Vous avez déjà un compte ?{" "}
                <Typography
                  component="a"
                  href="/login"
                  sx={{
                    color: "#77af0a",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Se connecter
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
