import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { authService } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function VerifyAccount() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  // Récupérer l'email depuis localStorage ou les paramètres d'URL
  useEffect(() => {
    const savedEmail = localStorage.getItem("registration_email");
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    console.log("=== RÉCUPÉRATION EMAIL ===");
    console.log("Email depuis localStorage:", savedEmail);
    console.log("Email depuis URL params:", emailParam);
    console.log("URL complète:", window.location.href);

    if (emailParam) {
      console.log("Utilisation de l'email depuis l'URL");
      setEmail(emailParam);
    } else if (savedEmail) {
      console.log("Utilisation de l'email depuis localStorage");
      setEmail(savedEmail);
    } else {
      console.log("Aucun email trouvé");
    }
    console.log("=== FIN RÉCUPÉRATION EMAIL ===");
  }, []);

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

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    try {
      // Préparer les données pour l'API
      const verificationData = {
        token: token,
        email: email,
      };

      console.log("=== VÉRIFICATION PAR TOKEN ===");
      console.log("Données envoyées à l'API:", verificationData);
      console.log("Email récupéré:", email);
      console.log("Token récupéré:", token);
      console.log("=== FIN VÉRIFICATION PAR TOKEN ===");

      const response = await authService.verifyAccount(verificationData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email non trouvé. Veuillez retourner à la page d'inscription.");
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour l'API
      const verificationData = {
        code: verificationCode,
        email: email,
      };

      console.log("=== VÉRIFICATION PAR CODE ===");
      console.log("Données envoyées à l'API:", verificationData);
      console.log("Email récupéré:", email);
      console.log("Code de vérification:", verificationCode);
      console.log("=== FIN VÉRIFICATION PAR CODE ===");

      const response = await authService.verifyAccount(verificationData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
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
            Vérification du compte
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Entrez le code de vérification reçu par email
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {success ? (
            <Typography color="success" sx={{ mb: 1 }}>
              Votre compte a été vérifié avec succès. Vous allez être redirigé vers la page de
              connexion...
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="verificationCode"
                label="Code de vérification"
                name="verificationCode"
                autoFocus
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
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
                {loading ? "VÉRIFICATION..." : "VÉRIFIER LE COMPTE"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
