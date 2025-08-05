import React, { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fonction pour vérifier la validité du token JWT
  const isTokenValid = (token) => {
    // Si le token existe et n'est pas vide, on le considère comme valide
    return typeof token === "string" && token.length > 0;
  };

  // Fonction pour vérifier et restaurer la session
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      console.log("[DEBUG][AuthContext] Vérification du token:", token);
      if (token && storedUser && isTokenValid(token)) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log("[DEBUG][AuthContext] Session restaurée avec succès:", userData);
        } catch (error) {
          console.error(
            "[DEBUG][AuthContext] Erreur lors de la restauration de la session:",
            error
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          console.log("[DEBUG][AuthContext] Token supprimé suite à une erreur de parsing user.");
        }
      } else {
        console.log("[DEBUG][AuthContext] Session invalide ou expirée, suppression du token.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error(
        "[DEBUG][AuthContext] Erreur lors de la vérification de l'authentification:",
        error
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      console.log("[DEBUG][AuthContext] Token supprimé suite à une erreur inattendue.");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    console.log("[DEBUG][AuthContext] useEffect de vérification de session appelé.");
    checkAuthStatus();
  }, []);

  // Écouter les événements d'erreur d'authentification
  useEffect(() => {
    const handleAuthError = () => {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      console.log("Réponse de login:", response);

      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;

        console.log("Token reçu:", token);
        console.log("Données utilisateur:", userData);

        // Stocker d'abord les données
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        console.log("Connexion réussie:", userData);
        return response;
      }
      throw new Error(response.message || "Erreur de connexion");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("Déconnexion effectuée");
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || "Erreur d'inscription");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    logout,
    register,
    isAuthenticated: !!user && isTokenValid(localStorage.getItem("token")),
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export default AuthContext;
