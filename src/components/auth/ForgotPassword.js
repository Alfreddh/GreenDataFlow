import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { authService } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.resetPasswordCode({ email });
      if (response.success) {
        setSuccess("Un code de réinitialisation a été envoyé à votre adresse email");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.resetPasswordVerification({
        email,
        code,
      });
      if (response.success) {
        setStep(3);
        setSuccess("Code vérifié avec succès");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        password: newPassword,
      });
      if (response.success) {
        setSuccess("Votre mot de passe a été réinitialisé avec succès");
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box component="form" onSubmit={handleSendCode}>
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
              {loading ? "ENVOI EN COURS..." : "ENVOYER LE CODE"}
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box component="form" onSubmit={handleVerifyCode}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Code de vérification"
              name="code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
              {loading ? "VÉRIFICATION..." : "VÉRIFIER LE CODE"}
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Nouveau mot de passe"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "RÉINITIALISATION..." : "RÉINITIALISER LE MOT DE PASSE"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Mot de passe oublié";
      case 2:
        return "Vérification du code";
      case 3:
        return "Nouveau mot de passe";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return "Entrez votre adresse email pour recevoir un code de réinitialisation";
      case 2:
        return "Entrez le code reçu par email";
      case 3:
        return "Choisissez un nouveau mot de passe";
      default:
        return "";
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
            {getStepTitle()}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            {getStepSubtitle()}
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success" sx={{ mb: 1 }}>
              {success}
            </Typography>
          )}

          {renderStep()}

          {step === 1 && (
            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 2 }}>
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
                  Retour à la connexion
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
