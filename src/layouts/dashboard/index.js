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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { Chart, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import DataTable from "examples/Tables/DataTable";

// React hooks
import React, { useEffect, useState, useRef } from "react";
import { formService } from "../../services/api";

Chart.register(ArcElement, ChartTooltip, Legend);

function Dashboard() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [formResponses, setFormResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [selectedEnqueteur, setSelectedEnqueteur] = useState("all");
  // Cache global avec localStorage pour persister entre les navigations
  const CACHE_KEY_FORMS = "dashboard_forms_cache";
  const CACHE_KEY_RESPONSES = "dashboard_responses_cache";
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Fonction pour vérifier si le cache est valide
  const isCacheValid = (cacheData) => {
    if (!cacheData) return false;
    const now = Date.now();
    return cacheData.timestamp && now - cacheData.timestamp < CACHE_EXPIRY;
  };

  // Fonction pour sauvegarder en cache
  const saveToCache = (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Erreur sauvegarde cache:", e);
    }
  };

  // Fonction pour récupérer du cache
  const getFromCache = (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      if (isCacheValid(cacheData)) {
        return cacheData.data;
      } else {
        // Cache expiré, le supprimer
        localStorage.removeItem(key);
        return null;
      }
    } catch (e) {
      console.error("Erreur lecture cache:", e);
      return null;
    }
  };

  // Charger la liste des formulaires au montage (avec cache localStorage)
  useEffect(() => {
    const fetchAllForms = async () => {
      // Vérifier si c'est un rechargement de page (F5)
      const isPageReload =
        performance.navigation.type === 1 ||
        (window.performance &&
          window.performance.getEntriesByType("navigation")[0]?.type === "reload");

      // Si c'est un rechargement, ignorer le cache et forcer le rechargement
      if (isPageReload) {
        console.log("Rechargement de page détecté - Forcer le rechargement des données");
        // Supprimer le cache pour forcer le rechargement
        localStorage.removeItem(CACHE_KEY_FORMS);
        localStorage.removeItem(CACHE_KEY_RESPONSES);
      } else {
        // Vérifier le cache localStorage pour la navigation normale
        const cachedForms = getFromCache(CACHE_KEY_FORMS);
        if (cachedForms) {
          console.log("Utilisation du cache localStorage pour les formulaires");
          setForms(cachedForms);
          setLoadingForms(false);
          if (cachedForms.length > 0) {
            setSelectedFormId(cachedForms[0].id);
          }
          return;
        }
      }

      setLoadingForms(true);
      try {
        let allForms = [];
        let nextUrl = null;

        // Récupérer tous les formulaires avec pagination
        do {
          const res = await formService.getAllForms(nextUrl);
          const formsData = res?.results?.data || res?.data || [];
          allForms = [...allForms, ...formsData];
          nextUrl = res?.next || null;
        } while (nextUrl);

        console.log("Tous les formulaires chargés:", allForms);
        setForms(allForms);
        // Sauvegarder en cache localStorage
        saveToCache(CACHE_KEY_FORMS, allForms);
        if (allForms.length > 0) {
          setSelectedFormId(allForms[0].id);
        }
      } catch (e) {
        console.error("Erreur lors du chargement des formulaires:", e);
        setForms([]);
      } finally {
        setLoadingForms(false);
      }
    };
    fetchAllForms();
  }, []);

  // Charger les réponses du formulaire sélectionné (avec cache localStorage)
  useEffect(() => {
    const fetchRealResponses = async () => {
      if (!selectedFormId) return;

      // Vérifier si c'est un rechargement de page (F5)
      const isPageReload =
        performance.navigation.type === 1 ||
        (window.performance &&
          window.performance.getEntriesByType("navigation")[0]?.type === "reload");

      // Si ce n'est pas un rechargement, vérifier le cache localStorage pour les réponses
      if (!isPageReload) {
        const cachedResponses = getFromCache(CACHE_KEY_RESPONSES);
        if (cachedResponses && cachedResponses[selectedFormId]) {
          console.log("Utilisation du cache localStorage pour les réponses:", selectedFormId);
          setFormResponses(cachedResponses[selectedFormId]);
          return;
        }
      }

      setLoadingResponses(true);
      try {
        // 1. Récupérer la liste des réponses (ids)
        const data = await formService.getFormResponsesV2(selectedFormId);
        const baseResponses = data.results?.data || [];

        // 2. Charger les datas détaillées pour chaque réponse
        const detailedResponses = await Promise.all(
          baseResponses.map(async (resp) => {
            try {
              const detail = await formService.getFormResponseDatas(resp.id);
              return detail.data;
            } catch (e) {
              console.error(`Erreur chargement réponse ${resp.id}:`, e);
              return null;
            }
          })
        );

        // 3. Filtrer les réponses nulles (erreur de chargement)
        const validResponses = detailedResponses.filter(Boolean);
        setFormResponses(validResponses);

        // Sauvegarder en cache localStorage seulement si ce n'est pas un rechargement
        if (!isPageReload) {
          const existingCache = getFromCache(CACHE_KEY_RESPONSES) || {};
          existingCache[selectedFormId] = validResponses;
          saveToCache(CACHE_KEY_RESPONSES, existingCache);
        }

        console.log("Vraies réponses chargées:", validResponses);
      } catch (e) {
        console.error("Erreur lors du chargement des réponses:", e);
        setFormResponses([]);
      }
      setLoadingResponses(false);
    };

    fetchRealResponses();
  }, [selectedFormId]);

  // === ANALYSE PAR ENQUÊTEUR ===
  // Extraire tous les enquêteurs uniques
  const getAllEnqueteurs = () => {
    const enqueteurs = new Set();
    formResponses.forEach((resp) => {
      const email = resp.response_form?.created_by || "Anonyme";
      enqueteurs.add(email);
    });
    return Array.from(enqueteurs).sort();
  };

  const enqueteurs = getAllEnqueteurs();

  // Filtrer les réponses par enquêteur
  const getFilteredResponses = () => {
    if (selectedEnqueteur === "all") return formResponses;
    return formResponses.filter(
      (resp) => (resp.response_form?.created_by || "Anonyme") === selectedEnqueteur
    );
  };

  const filteredResponses = getFilteredResponses();

  // Statistiques par enquêteur
  const getEnqueteurStats = () => {
    const stats = {};
    enqueteurs.forEach((enqueteur) => {
      const responses = formResponses.filter(
        (resp) => (resp.response_form?.created_by || "Anonyme") === enqueteur
      );

      // Réponses aujourd'hui
      const today = new Date().toLocaleDateString();
      const todayCount = responses.filter((r) => {
        const d = r.response_form?.created_at
          ? new Date(r.response_form.created_at).toLocaleDateString()
          : "";
        return d === today;
      }).length;

      // Dernière activité
      const lastActivity =
        responses.length > 0
          ? responses.reduce((latest, r) => {
              const d = new Date(r.response_form?.created_at || 0);
              return d > latest ? d : latest;
            }, new Date(0))
          : null;

      stats[enqueteur] = {
        total: responses.length,
        today: todayCount,
        lastActivity: lastActivity ? lastActivity.toLocaleString() : "Aucune",
        efficiency: responses.length > 0 ? Math.round((todayCount / responses.length) * 100) : 0,
      };
    });
    return stats;
  };

  const enqueteurStats = getEnqueteurStats();

  // === STATISTIQUES GLOBALES ===
  const totalResponses = filteredResponses.length;
  const totalEnqueteurs = enqueteurs.length;

  // Trouver la dernière soumission
  const lastSubmission =
    filteredResponses.length > 0
      ? filteredResponses
          .reduce((latest, r) => {
            const d = new Date(r.response_form?.created_at || 0);
            return d > latest ? d : latest;
          }, new Date(0))
          .toLocaleString()
      : "-";

  // Extraire toutes les réponses aux paramètres pour l'analyse
  const allParameterResponses = filteredResponses.flatMap((resp) =>
    Array.isArray(resp.parameter_responses) ? resp.parameter_responses : []
  );

  // Trouver la première question numérique pour la moyenne
  let numericKey = null;
  let numericValues = [];
  if (allParameterResponses.length > 0) {
    const numericResponses = allParameterResponses.filter((pr) => {
      const value = pr.value;
      return value && !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    });
    if (numericResponses.length > 0) {
      numericKey = numericResponses[0].parameter_libelle;
      numericValues = numericResponses.map((pr) => parseFloat(pr.value));
    }
  }

  const numericAvg =
    numericValues.length > 0
      ? (numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length).toFixed(2)
      : "-";

  // Trouver la première question à choix pour la répartition
  let choiceKey = null;
  let choiceOptions = [];
  let choiceCounts = {};

  if (allParameterResponses.length > 0) {
    // Chercher une réponse avec des modalités (choix)
    const choiceResponse = allParameterResponses.find(
      (pr) => pr.modalities && Array.isArray(pr.modalities) && pr.modalities.length > 0
    );

    if (choiceResponse) {
      choiceKey = choiceResponse.parameter_libelle;
      choiceOptions = choiceResponse.modalities.map((m) => m.libelle);

      // Compter les occurrences de chaque modalité
      choiceCounts = choiceOptions.reduce((acc, opt) => {
        acc[opt] = allParameterResponses.filter(
          (pr) =>
            pr.parameter_libelle === choiceKey && pr.modalities?.some((m) => m.libelle === opt)
        ).length;
        return acc;
      }, {});
    } else {
      // Fallback: chercher des réponses binaires (Oui/Non)
      const binaryResponses = allParameterResponses.filter(
        (pr) => pr.value === "Oui" || pr.value === "Non"
      );
      if (binaryResponses.length > 0) {
        choiceKey = binaryResponses[0].parameter_libelle;
        choiceOptions = ["Oui", "Non"];
        choiceCounts = {
          Oui: binaryResponses.filter((pr) => pr.value === "Oui").length,
          Non: binaryResponses.filter((pr) => pr.value === "Non").length,
        };
      }
    }
  }

  // Statistique : taux Oui/Non sur les questions binaires
  let binaryYes = 0,
    binaryNo = 0;
  if (allParameterResponses.length > 0) {
    binaryYes = allParameterResponses.filter((pr) => pr.value === "Oui").length;
    binaryNo = allParameterResponses.filter((pr) => pr.value === "Non").length;
  }

  const binaryRate =
    binaryYes + binaryNo > 0
      ? `${((binaryYes / (binaryYes + binaryNo)) * 100).toFixed(0)}% Oui`
      : "-";

  // Statistique : nombre de réponses aujourd'hui
  const today = new Date().toLocaleDateString();
  const todayCount = filteredResponses.filter((r) => {
    const d = r.response_form?.created_at
      ? new Date(r.response_form.created_at).toLocaleDateString()
      : "";
    return d === today;
  }).length;

  // Données pour le line chart (évolution des réponses par jour)
  const dateCounts = {};
  filteredResponses.forEach((r) => {
    const d = r.response_form?.created_at
      ? new Date(r.response_form.created_at).toLocaleDateString()
      : "-";
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });
  const lineLabels = Object.keys(dateCounts);
  const lineData = Object.values(dateCounts);

  // Données pour le bar chart (répartition des choix)
  const barLabels = choiceOptions;
  const barData = choiceOptions.map((opt) => choiceCounts[opt] || 0);

  // Colonnes pour le tableau des enquêteurs
  const enqueteurColumns = [
    { Header: "Enquêteur", accessor: "enqueteur", align: "left" },
    { Header: "Total Réponses", accessor: "total", align: "center" },
    { Header: "Aujourd'hui", accessor: "today", align: "center" },
    { Header: "Efficacité", accessor: "efficiency", align: "center" },
    { Header: "Dernière Activité", accessor: "lastActivity", align: "left" },
  ];

  const enqueteurRows = Object.entries(enqueteurStats).map(([enqueteur, stats]) => ({
    enqueteur: (
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 32,
            height: 32,
            fontSize: "14px",
          }}
        >
          {enqueteur.charAt(0).toUpperCase()}
        </Avatar>
        <MDTypography variant="body2" fontWeight="medium">
          {enqueteur}
        </MDTypography>
      </Box>
    ),
    total: <Chip label={stats.total} color="primary" size="small" sx={{ fontWeight: "bold" }} />,
    today: (
      <Chip
        label={stats.today}
        color={stats.today > 0 ? "success" : "default"}
        size="small"
        variant={stats.today > 0 ? "filled" : "outlined"}
      />
    ),
    efficiency: (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress
          variant="determinate"
          value={stats.efficiency}
          size={24}
          sx={{ color: stats.efficiency > 50 ? "success.main" : "warning.main" }}
        />
        <MDTypography variant="caption" fontWeight="medium">
          {stats.efficiency}%
        </MDTypography>
      </Box>
    ),
    lastActivity: (
      <MDTypography variant="body2" color="text.secondary">
        {stats.lastActivity}
      </MDTypography>
    ),
  }));

  // Colonnes pour le tableau des réponses
  const responseColumns = [
    { Header: "ID", accessor: "id", align: "left" },
    { Header: "Enquêteur", accessor: "enqueteur", align: "left" },
    { Header: "Date de création", accessor: "created_at", align: "left" },
  ];

  const responseRows = filteredResponses.map((resp) => {
    const row = {
      id: resp.response_form?.id || resp.id,
      enqueteur: (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 24,
              height: 24,
              fontSize: "12px",
            }}
          >
            {(resp.response_form?.created_by || "A").charAt(0).toUpperCase()}
          </Avatar>
          <MDTypography variant="body2" fontWeight="medium">
            {resp.response_form?.created_by || "Anonyme"}
          </MDTypography>
        </Box>
      ),
      created_at: resp.response_form?.created_at
        ? new Date(resp.response_form.created_at).toLocaleString()
        : "Date inconnue",
    };

    // Ajouter les réponses aux paramètres (max 2 pour éviter l'encombrement)
    if (Array.isArray(resp.parameter_responses)) {
      resp.parameter_responses.slice(0, 2).forEach((pr) => {
        const key = pr.parameter_libelle || `Paramètre ${pr.id}`;
        row[key] = (
          <MDTypography fontSize={13} color="text.secondary">
            {pr.value || "Aucune valeur"}
          </MDTypography>
        );
      });
    }

    return row;
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Styles CSS globaux pour les animations */}
      <style>
        {`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
          }
          
          .dashboard-card {
            animation: slideInUp 0.8s ease-out;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 20px;
            overflow: hidden;
            position: relative;
          }
          
          .dashboard-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          }
          
          .stats-card {
            animation: scaleIn 0.6s ease-out;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            overflow: hidden;
            position: relative;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          .stats-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.8s;
          }
          
          .stats-card:hover::before {
            transform: translateX(100%);
          }
          
          .stats-card:hover {
            animation: glow 2s infinite;
          }
          
          .chart-container {
            animation: fadeInUp 1s ease-out;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
          }
          
          .table-container {
            animation: slideInUp 0.9s ease-out;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
          }
          
          .selection-card {
            animation: slideInUp 0.7s ease-out;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          
          .floating-icon {
            animation: float 3s ease-in-out infinite;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>

      {/* Sélection moderne de formulaire */}
      <MDBox pt={2} pb={2} mb={2}>
        <MDBox mb={2} px={3}>
          <Box className="selection-card" p={4}>
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <Box
                className="floating-icon"
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                }}
              >
                <Icon sx={{ fontSize: 28, color: "#fff" }}>analytics</Icon>
              </Box>
              <Box>
                <MDTypography variant="h4" fontWeight="bold" color="primary" mb={1}>
                  📊 Tableau de Bord Analytique
                </MDTypography>
                <MDTypography variant="body1" color="text.secondary" sx={{ fontSize: "16px" }}>
                  Sélectionnez un formulaire pour analyser ses performances en temps réel
                </MDTypography>
              </Box>
            </Box>

            {loadingForms ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  borderRadius: 3,
                  border: "2px dashed #ccc",
                  animation: "pulse 2s infinite",
                  mx: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} sx={{ color: "#77af0a" }} />
                  <MDTypography variant="h6" color="text.secondary">
                    Chargement des formulaires...
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Veuillez patienter pendant que nous récupérons vos données
                  </MDTypography>
                </Box>
              </Paper>
            ) : (
              <Box sx={{ width: "100%", px: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={selectedFormId}
                    onChange={(e) => setSelectedFormId(e.target.value)}
                    displayEmpty
                    placeholder="Choisir un formulaire"
                    sx={{
                      background: "#fff",
                      borderRadius: 3,
                      minHeight: 56,
                      fontSize: 16,
                      fontWeight: 500,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      border: "2px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 6px 25px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        borderColor: "#77af0a",
                        boxShadow: "0 8px 30px rgba(119, 175, 10, 0.15)",
                      },
                      "& .MuiSelect-icon": {
                        color: "#77af0a",
                        fontSize: 24,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiSelect-select": {
                        color: selectedFormId ? "#333" : "#999",
                        fontWeight: selectedFormId ? 600 : 400,
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 3,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                          border: "1px solid #e0e0e0",
                          maxHeight: 400,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choisir un formulaire
                    </MenuItem>
                    {forms.map((form, index) => (
                      <MenuItem
                        key={form.id}
                        value={form.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 2,
                          px: 3,
                          fontSize: 15,
                          fontWeight: 500,
                          borderBottom: "1px solid #f5f5f5",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)",
                            transform: "translateX(4px)",
                          },
                          "&.Mui-selected": {
                            background: "linear-gradient(135deg, #77af0a 0%, #8bc34a 100%)",
                            color: "#fff",
                            fontWeight: 600,
                            "&:hover": {
                              background: "linear-gradient(135deg, #6a9a09 0%, #7cb342 100%)",
                            },
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "rgba(119, 175, 10, 0.1)",
                            color: "#77af0a",
                          }}
                        >
                          📋
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <MDTypography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: 15,
                              lineHeight: 1.3,
                            }}
                          >
                            {form.title || `Formulaire ${index + 1}`}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.8)",
                              fontSize: 12,
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {form.parameters?.length || 0} questions
                          </MDTypography>
                        </Box>
                        {selectedFormId === form.id && (
                          <Icon sx={{ fontSize: 20, color: "#fff" }}>check_circle</Icon>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Indicateur de formulaire sélectionné */}
                {selectedFormId && forms.length > 0 && (
                  <MDBox
                    mt={3}
                    p={3}
                    sx={{
                      background: "linear-gradient(135deg, #77af0a 0%, #8bc34a 100%)",
                      borderRadius: 3,
                      color: "#fff",
                      boxShadow: "0 8px 25px rgba(119, 175, 10, 0.2)",
                      animation: "slideIn 0.5s ease-out",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon sx={{ fontSize: 24, color: "#fff" }}>analytics</Icon>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <MDTypography variant="h6" fontWeight="bold" color="#fff" mb={0.5}>
                          {forms.find((f) => f.id === selectedFormId)?.title ||
                            "Formulaire sélectionné"}
                        </MDTypography>
                        <MDTypography variant="body2" color="rgba(255,255,255,0.9)">
                          Analyse en cours - {totalResponses} réponses collectées par{" "}
                          {totalEnqueteurs} enquêteur(s)
                        </MDTypography>
                      </Box>
                      <Chip
                        label="Actif"
                        size="small"
                        sx={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Box>
                  </MDBox>
                )}
              </Box>
            )}
          </Box>
        </MDBox>
      </MDBox>

      {/* Filtre par enquêteur */}
      {selectedFormId && enqueteurs.length > 0 && (
        <MDBox py={1} mb={2} px={3}>
          <Box className="selection-card" p={3}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                }}
              >
                <Icon sx={{ fontSize: 20, color: "#fff" }}>group</Icon>
              </Box>
              <Box>
                <MDTypography variant="h6" fontWeight="bold" color="primary" mb={0.5}>
                  👥 Filtre par Enquêteur
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  Analysez les performances par enquêteur spécifique
                </MDTypography>
              </Box>
            </Box>
            <FormControl sx={{ minWidth: 300 }}>
              <Select
                value={selectedEnqueteur}
                onChange={(e) => setSelectedEnqueteur(e.target.value)}
                sx={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 3,
                  minHeight: 56,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: 16,
                  fontWeight: 500,
                  "& .MuiSelect-select": {
                    padding: "16px 20px",
                    fontSize: 16,
                    fontWeight: 500,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid rgba(0,0,0,0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                }}
              >
                <MenuItem value="all">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Icon sx={{ color: "#77af0a" }}>group</Icon>
                    Tous les enquêteurs ({totalResponses} réponses)
                  </Box>
                </MenuItem>
                {enqueteurs.map((enqueteur) => (
                  <MenuItem key={enqueteur} value={enqueteur}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 24,
                          height: 24,
                          fontSize: "12px",
                        }}
                      >
                        {enqueteur.charAt(0).toUpperCase()}
                      </Avatar>
                      {enqueteur} ({enqueteurStats[enqueteur]?.total || 0} réponses)
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </MDBox>
      )}

      {/* Statistiques globales dynamiques */}
      <MDBox py={1} mb={2} px={3}>
        <Box mb={2}>
          <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
            📈 Statistiques Globales
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Vue d&apos;ensemble des performances de votre formulaire
          </MDTypography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Box className="stats-card" sx={{ height: "100%" }}>
              <ComplexStatisticsCard
                color="info"
                icon="assignment_turned_in"
                title="Réponses collectées"
                count={totalResponses}
                percentage={{ color: "success", amount: "", label: "total" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Box className="stats-card" sx={{ height: "100%" }}>
              <ComplexStatisticsCard
                color="success"
                icon="group"
                title="Enquêteurs actifs"
                count={totalEnqueteurs}
                percentage={{ color: "info", amount: "", label: "" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Box className="stats-card" sx={{ height: "100%" }}>
              <ComplexStatisticsCard
                color="warning"
                icon="today"
                title="Réponses aujourd'hui"
                count={todayCount}
                percentage={{ color: "info", amount: "", label: "" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Box className="stats-card" sx={{ height: "100%" }}>
              <ComplexStatisticsCard
                color="primary"
                icon="calculate"
                title={numericKey ? `Moyenne (${numericKey})` : "Aucune question numérique"}
                count={numericAvg}
                percentage={{ color: "info", amount: "", label: "" }}
              />
            </Box>
          </Grid>
        </Grid>
      </MDBox>

      {/* Tableau des performances par enquêteur */}
      {selectedFormId && enqueteurs.length > 0 && (
        <MDBox py={1} mb={2} px={3}>
          <Box mb={2}>
            <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
              🏆 Classement des Enquêteurs
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              Analyse comparative des performances par enquêteur
            </MDTypography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box className="table-container">
                <Card sx={{ p: 0, borderRadius: 3, boxShadow: 2 }}>
                  <MDBox p={3} pb={2}>
                    <DataTable
                      table={{ columns: enqueteurColumns, rows: enqueteurRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </MDBox>
      )}

      {/* Graphiques dynamiques */}
      <MDBox mt={1} mb={2} px={3}>
        <Box mb={2}>
          <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
            📊 Visualisations Analytiques
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Graphiques interactifs pour analyser les tendances et répartitions
          </MDTypography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="chart-container">
              <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <MDBox mb={3}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: "#fff" }}>trending_up</Icon>
                    </Box>
                    <MDTypography variant="h6" fontWeight="bold" color="primary">
                      📈 Évolution des réponses
                    </MDTypography>
                  </Box>
                  <MDTypography variant="body2" color="text.secondary">
                    Nombre de réponses par jour{" "}
                    {selectedEnqueteur !== "all" ? `(${selectedEnqueteur})` : ""}
                  </MDTypography>
                </MDBox>
                {lineLabels.length > 0 ? (
                  <ReportsLineChart
                    color="info"
                    title=""
                    description=""
                    date=""
                    chart={{
                      labels: lineLabels,
                      datasets: [
                        {
                          label: "Réponses",
                          data: lineData,
                          borderColor: "#667eea",
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          tension: 0.4,
                        },
                      ],
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    py={5}
                    sx={{ color: "text.secondary" }}
                  >
                    <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>show_chart</Icon>
                    <MDTypography variant="h6" color="text.secondary">
                      Aucune donnée disponible
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                      Les graphiques apparaîtront avec les réponses
                    </MDTypography>
                  </Box>
                )}
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="chart-container">
              <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <MDBox mb={3}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: "#fff" }}>pie_chart</Icon>
                    </Box>
                    <MDTypography variant="h6" fontWeight="bold" color="primary">
                      🎯 Répartition des réponses
                    </MDTypography>
                  </Box>
                  <MDTypography variant="body2" color="text.secondary">
                    {choiceKey ? `Répartition pour: ${choiceKey}` : "Répartition des choix"}
                  </MDTypography>
                </MDBox>
                {barLabels.length > 0 ? (
                  <ReportsBarChart
                    color="success"
                    title=""
                    description=""
                    date=""
                    chart={{
                      labels: barLabels,
                      datasets: [
                        {
                          label: "Réponses",
                          backgroundColor: [
                            "#77af0a",
                            "#ffa726",
                            "#42a5f5",
                            "#ab47bc",
                            "#ef5350",
                            "#26a69a",
                          ],
                          data: barData,
                        },
                      ],
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    py={5}
                    sx={{ color: "text.secondary" }}
                  >
                    <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>pie_chart</Icon>
                    <MDTypography variant="h6" color="text.secondary">
                      Aucune donnée disponible
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                      Les graphiques apparaîtront avec les réponses
                    </MDTypography>
                  </Box>
                )}
              </Card>
            </Box>
          </Grid>
        </Grid>
      </MDBox>

      {/* Tableau des réponses */}
      <MDBox py={1} mb={2} px={3}>
        <Box mb={2}>
          <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
            📋 Historique des Réponses
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Détail complet de toutes les réponses collectées
          </MDTypography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box className="table-container">
              <Card sx={{ p: 0, borderRadius: 3, boxShadow: 2 }}>
                <MDBox p={3} pb={2}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: "#333" }}>list_alt</Icon>
                    </Box>
                    <MDTypography variant="h6" fontWeight="bold" color="primary">
                      📋 Dernières réponses du formulaire
                    </MDTypography>
                  </Box>
                  <MDTypography variant="body2" color="text.secondary" mb={3}>
                    {selectedEnqueteur !== "all"
                      ? `Réponses de ${selectedEnqueteur}`
                      : "Toutes les réponses"}
                  </MDTypography>
                  {loadingResponses ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                      <CircularProgress />
                    </Box>
                  ) : filteredResponses.length === 0 ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      py={5}
                      sx={{ color: "text.secondary" }}
                    >
                      <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>inbox</Icon>
                      <MDTypography variant="h6" color="text.secondary">
                        Aucune réponse trouvée
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Les réponses apparaîtront ici une fois collectées
                      </MDTypography>
                    </Box>
                  ) : (
                    <DataTable
                      table={{ columns: responseColumns, rows: responseRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )}
                </MDBox>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
