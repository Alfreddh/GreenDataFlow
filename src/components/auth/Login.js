import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      // La redirection sera gérée par le useEffect ci-dessus
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
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
            Connexion
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Connectez-vous à votre compte
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
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
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
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
              disabled={authLoading}
            >
              {authLoading ? "CONNEXION EN COURS..." : "SE CONNECTER"}
            </Button>

            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 2 }}>
                <Typography
                  component="a"
                  href="/forgot-password"
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
                  Mot de passe oublié ?
                </Typography>
                {" | "}
                <Typography
                  component="a"
                  href="/register"
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
                  Pas encore de compte ? S&apos;inscrire
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
