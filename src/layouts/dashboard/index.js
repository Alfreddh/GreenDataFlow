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
import Button from "@mui/material/Button";
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
import ReportsPieChart from "examples/Charts/PieCharts/ReportsPieChart";
import ReportsDoughnutChart from "examples/Charts/DoughnutCharts/ReportsDoughnutChart";
import ReportsHorizontalBarChart from "examples/Charts/HorizontalBarCharts/ReportsHorizontalBarChart";

// React hooks
import React, { useEffect, useState, useRef } from "react";
import { formService } from "../../services/api";

// Import des bibliothèques d'export
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

Chart.register(ArcElement, ChartTooltip, Legend);

function Dashboard() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [formResponses, setFormResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [selectedEnqueteur, setSelectedEnqueteur] = useState("all");
  const [chartSize, setChartSize] = useState("medium");
  const [defaultChartType, setDefaultChartType] = useState("pie");
  const [formData, setFormData] = useState(null);
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

  // Charger les données du formulaire sélectionné
  useEffect(() => {
    const fetchFormData = async () => {
      if (!selectedFormId) return;

      try {
        const form = forms.find((f) => f.id === selectedFormId);
        if (form) {
          // Transformer les données du formulaire pour correspondre à la structure attendue
          const transformedFormData = {
            id: form.id,
            title: form.title,
            description: form.description,
            questions: (form.parameters || []).map((param, idx) => ({
              id: param.id || `q_${idx + 1}`,
              label: param.libelle,
              type: param.type,
              required: param.is_required,
              options: param.modalities?.map((m) => m.libelle) || [],
              modalities: param.modalities || [],
            })),
          };
          setFormData(transformedFormData);
        }
      } catch (e) {
        console.error("Erreur lors du chargement des données du formulaire:", e);
      }
    };

    fetchFormData();
  }, [selectedFormId, forms]);

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

  // Fonction pour générer le rapport détaillé
  const generateDetailedReport = () => {
    if (!formData || !formData.questions) return [];

    return formData.questions.map((question, index) => {
      const questionResponses = allParameterResponses.filter(
        (pr) => pr.parameter_libelle === question.label
      );

      const totalResponses = questionResponses.length;
      const hasData = totalResponses > 0;

      if (!hasData) {
        return (
          <Box
            key={question.id}
            sx={{
              mb: 6,
              p: 4,
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              backgroundColor: "#f8fafc",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <MDTypography variant="h6" fontWeight="bold" color="primary" mb={2}>
              {index + 1}. {question.label}
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
              Type : {question.type}. Aucune réponse pour cette question.
            </MDTypography>
          </Box>
        );
      }

      // Analyser les réponses selon le type de question
      let analysis = {};
      let chartData = null;

      switch (question.type) {
        case "choix_unique":
        case "binaire":
          analysis = analyzeChoiceQuestion(questionResponses, question);
          chartData = generateChartData(analysis, defaultChartType);
          break;
        case "choix_multiple":
          analysis = analyzeMultipleChoiceQuestion(questionResponses, question);
          chartData = generateChartData(analysis, defaultChartType);
          break;
        case "texte":
        case "nombre_entier":
        case "nombre_decimal":
          analysis = analyzeTextQuestion(questionResponses, question);
          chartData = generateChartData(analysis, "bar");
          break;
        case "date":
        case "datetime":
          analysis = analyzeDateQuestion(questionResponses, question);
          chartData = generateChartData(analysis, "line");
          break;
        default:
          analysis = analyzeGenericQuestion(questionResponses, question);
          chartData = generateChartData(analysis, defaultChartType);
      }

      return (
        <Box
          key={question.id}
          sx={{
            mb: 6,
            p: 4,
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <MDTypography variant="h6" fontWeight="bold" color="primary" mb={2}>
            {index + 1}. {question.label}
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary" mb={3} sx={{ fontSize: "13px" }}>
            Type : {question.type}. {totalResponses} sur {filteredResponses.length} répondants ont
            répondu à cette question.
          </MDTypography>

          {/* Tableau des données */}
          <Box sx={{ mb: 3 }}>
            <MDTypography variant="subtitle2" fontWeight="bold" mb={2}>
              Répartition des réponses
            </MDTypography>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        border: "1px solid #e2e8f0",
                        fontWeight: "600",
                        fontSize: "12px",
                      }}
                    >
                      Valeur
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        border: "1px solid #e2e8f0",
                        fontWeight: "600",
                        fontSize: "12px",
                      }}
                    >
                      Fréquence
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        border: "1px solid #e2e8f0",
                        fontWeight: "600",
                        fontSize: "12px",
                      }}
                    >
                      Pourcentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.data.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #e2e8f0",
                          wordBreak: "break-word",
                          fontSize: "12px",
                        }}
                      >
                        {typeof item.label === "object" ? "Fichier" : item.label}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "center",
                          border: "1px solid #e2e8f0",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        {item.value}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "center",
                          border: "1px solid #e2e8f0",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          {/* Graphique */}
          {chartData && chartData.datasets && chartData.datasets[0].data.some((val) => val > 0) && (
            <Box sx={{ mt: 4, mb: 0 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <MDTypography variant="subtitle2" fontWeight="bold">
                  Visualisation
                </MDTypography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={chartData.type}
                    onChange={(e) => updateChartType(question.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="pie">Secteur</MenuItem>
                    <MenuItem value="bar">Barres verticales</MenuItem>
                    <MenuItem value="horizontalBar">Barres horizontales</MenuItem>
                    <MenuItem value="doughnut">Anneau</MenuItem>
                    <MenuItem value="line">Ligne</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  height:
                    chartData.type === "bar"
                      ? chartSize === "small"
                        ? 220
                        : chartSize === "large"
                        ? 300
                        : 250
                      : chartSize === "small"
                      ? 320
                      : chartSize === "large"
                      ? 450
                      : 370,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  backgroundColor: "#fafbfc",
                  p: 2,
                  pt: 1,
                }}
              >
                {renderChart(chartData)}
              </Box>
            </Box>
          )}
        </Box>
      );
    });
  };

  // Fonctions d'analyse par type de question
  const analyzeChoiceQuestion = (responses, question) => {
    const counts = {};
    responses.forEach((resp) => {
      let value = resp.value || "Sans réponse";

      // Gérer les objets File
      if (typeof value === "object" && value !== null) {
        if (value instanceof File) {
          value = `Fichier: ${value.name}`;
        } else {
          value = "Objet";
        }
      }

      counts[value] = (counts[value] || 0) + 1;
    });

    const total = responses.length;
    const data = Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      percentage: ((value / total) * 100).toFixed(2),
    }));

    return { data, total };
  };

  const analyzeMultipleChoiceQuestion = (responses, question) => {
    const counts = {};
    responses.forEach((resp) => {
      if (resp.modalities && Array.isArray(resp.modalities)) {
        resp.modalities.forEach((mod) => {
          const label = mod.libelle || "Option inconnue";
          counts[label] = (counts[label] || 0) + 1;
        });
      }
    });

    const total = responses.length;
    const data = Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      percentage: ((value / total) * 100).toFixed(2),
    }));

    return { data, total };
  };

  const analyzeTextQuestion = (responses, question) => {
    const counts = {};
    responses.forEach((resp) => {
      let value = resp.value || "Sans réponse";

      // Gérer les objets File
      if (typeof value === "object" && value !== null) {
        if (value instanceof File) {
          value = `Fichier: ${value.name}`;
        } else {
          value = "Objet";
        }
      }

      counts[value] = (counts[value] || 0) + 1;
    });

    // Trier par fréquence décroissante et limiter à 10 valeurs
    const sortedEntries = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const total = responses.length;
    const data = sortedEntries.map(([label, value]) => ({
      label,
      value,
      percentage: ((value / total) * 100).toFixed(2),
    }));

    return { data, total };
  };

  const analyzeDateQuestion = (responses, question) => {
    const counts = {};
    responses.forEach((resp) => {
      let dateLabel = "Sans réponse";
      if (resp.value) {
        try {
          const date = new Date(resp.value);
          // Formater la date de manière plus courte
          dateLabel = date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (e) {
          dateLabel = "Date invalide";
        }
      }
      counts[dateLabel] = (counts[dateLabel] || 0) + 1;
    });

    const total = responses.length;
    const data = Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      percentage: ((value / total) * 100).toFixed(2),
    }));

    return { data, total };
  };

  const analyzeGenericQuestion = (responses, question) => {
    return analyzeChoiceQuestion(responses, question);
  };

  // Génération des données de graphique
  const generateChartData = (analysis, chartType) => {
    const colors = [
      "#77af0a",
      "#ffa726",
      "#42a5f5",
      "#ab47bc",
      "#ef5350",
      "#26a69a",
      "#8bc34a",
      "#ff9800",
      "#2196f3",
      "#9c27b0",
      "#f44336",
      "#009688",
    ];

    // S'assurer qu'on a des données valides
    if (!analysis.data || analysis.data.length === 0) {
      return null;
    }

    return {
      type: chartType,
      labels: analysis.data.map((item) => item.label),
      datasets: [
        {
          label: "Réponses",
          data: analysis.data.map((item) => parseInt(item.value) || 0),
          backgroundColor: colors.slice(0, analysis.data.length),
          borderColor: colors.slice(0, analysis.data.length),
          borderWidth: 2,
        },
      ],
    };
  };

  // Rendu du graphique
  const renderChart = (chartData) => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <MDTypography variant="body2" color="text.secondary">
            Aucune donnée disponible pour ce graphique
          </MDTypography>
        </Box>
      );
    }

    const chartProps = {
      color: "info",
      title: "",
      description: "",
      date: "",
      chart: chartData,
    };

    switch (chartData.type) {
      case "pie":
        return <ReportsPieChart {...chartProps} />;
      case "doughnut":
        return <ReportsDoughnutChart {...chartProps} />;
      case "line":
        return <ReportsLineChart {...chartProps} />;
      case "horizontalBar":
        return <ReportsHorizontalBarChart {...chartProps} />;
      default:
        return <ReportsBarChart {...chartProps} />;
    }
  };

  // Mise à jour du type de graphique
  const updateChartType = (questionId, newType) => {
    // Cette fonction sera implémentée pour permettre le changement dynamique
    console.log(`Changement du type de graphique pour la question ${questionId} vers ${newType}`);
  };

  // Export du rapport
  const exportReport = async (format) => {
    if (!formData || !filteredResponses.length) {
      alert("Aucune donnée disponible pour l'export");
      return;
    }

    const formTitle = formData.title || "Rapport";
    const timestamp = new Date().toISOString().split("T")[0];

    try {
      switch (format.toLowerCase()) {
        case "excel":
          await exportToExcel(formTitle, timestamp);
          break;
        case "word":
          await exportToWord(formTitle, timestamp);
          break;
        default:
          alert("Format non supporté");
      }
    } catch (error) {
      console.error(`Erreur lors de l'export ${format}:`, error);
      alert(`Erreur lors de l'export ${format.toUpperCase()}`);
    }
  };

  // Fonction d'export Excel
  const exportToExcel = async (formTitle, timestamp) => {
    const workbook = XLSX.utils.book_new();

    // Feuille des statistiques générales
    const statsData = [
      ["Statistiques Générales"],
      ["", ""],
      ["Total des réponses", totalResponses],
      ["Enquêteurs actifs", totalEnqueteurs],
      ["Réponses aujourd'hui", todayCount],
      ["Dernière soumission", lastSubmission],
      ["", ""],
      ["Moyenne numérique", numericAvg],
      ["Taux binaire", binaryRate],
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistiques");

    // Feuille des enquêteurs
    if (enqueteurs.length > 0) {
      const enqueteurData = [
        ["Enquêteur", "Total Réponses", "Aujourd'hui", "Efficacité (%)", "Dernière Activité"],
      ];

      Object.entries(enqueteurStats).forEach(([enqueteur, stats]) => {
        enqueteurData.push([
          enqueteur,
          stats.total,
          stats.today,
          stats.efficiency,
          stats.lastActivity,
        ]);
      });

      const enqueteurSheet = XLSX.utils.aoa_to_sheet(enqueteurData);
      XLSX.utils.book_append_sheet(workbook, enqueteurSheet, "Enquêteurs");
    }

    // Feuille pour chaque question
    formData.questions.forEach((question, index) => {
      const questionResponses = allParameterResponses.filter(
        (pr) => pr.parameter_libelle === question.label
      );

      const questionData = [
        [`Question ${index + 1}: ${question.label}`],
        [`Type: ${question.type}`],
        [`Réponses: ${questionResponses.length} sur ${filteredResponses.length}`],
        ["", ""],
        ["Valeur", "Fréquence", "Pourcentage"],
      ];

      if (questionResponses.length > 0) {
        let analysis = {};
        switch (question.type) {
          case "choix_unique":
          case "binaire":
            analysis = analyzeChoiceQuestion(questionResponses, question);
            break;
          case "choix_multiple":
            analysis = analyzeMultipleChoiceQuestion(questionResponses, question);
            break;
          case "texte":
          case "nombre_entier":
          case "nombre_decimal":
            analysis = analyzeTextQuestion(questionResponses, question);
            break;
          case "date":
          case "datetime":
            analysis = analyzeDateQuestion(questionResponses, question);
            break;
          default:
            analysis = analyzeGenericQuestion(questionResponses, question);
        }

        if (analysis.data) {
          analysis.data.forEach((item) => {
            // Garder le texte complet pour Excel
            questionData.push([item.label, item.value, `${item.percentage}%`]);
          });
        }
      } else {
        questionData.push(["Aucune réponse", 0, "0%"]);
      }

      const questionSheet = XLSX.utils.aoa_to_sheet(questionData);

      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 50 }, // Valeur - largeur maximale
        { wch: 15 }, // Fréquence
        { wch: 15 }, // Pourcentage
      ];
      questionSheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, questionSheet, `Q${index + 1}`);
    });

    // Sauvegarder le fichier Excel
    XLSX.writeFile(workbook, `${formTitle}_Rapport_${timestamp}.xlsx`);
  };

  // Fonction d'export PDF du classement des enquêteurs
  const exportEnqueteursPDF = async () => {
    if (!selectedFormId || enqueteurs.length === 0) {
      alert("Aucune donnée d'enquêteur disponible pour l'export");
      return;
    }

    const formTitle = forms.find((f) => f.id === selectedFormId)?.title || "Formulaire";
    const timestamp = new Date().toISOString().split("T")[0];
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Titre principal
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Enquêteurs - ${formTitle}`, pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Informations générales
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date d'export: ${timestamp}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Total des réponses: ${totalResponses}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Nombre d'enquêteurs: ${totalEnqueteurs}`, margin, yPosition);
    yPosition += 15;

    // Tableau des enquêteurs
    const tableData = [["Enquêteur", "Total Réponses", "Dernière Activité"]];

    Object.entries(enqueteurStats).forEach(([enqueteur, stats]) => {
      tableData.push([enqueteur, stats.total.toString(), stats.lastActivity]);
    });

    // Dessiner le tableau
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = [
      tableWidth * 0.4, // Enquêteur
      tableWidth * 0.25, // Total Réponses
      tableWidth * 0.35, // Dernière Activité
    ];
    let xPos = margin;

    // En-têtes
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    tableData[0].forEach((header, colIndex) => {
      pdf.rect(xPos, yPosition - 5, colWidths[colIndex], 8);
      pdf.text(header, xPos + 2, yPosition);
      xPos += colWidths[colIndex];
    });

    yPosition += 8;

    // Données
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    for (let rowIndex = 1; rowIndex < tableData.length; rowIndex++) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      xPos = margin;
      tableData[rowIndex].forEach((cell, colIndex) => {
        pdf.rect(xPos, yPosition - 5, colWidths[colIndex], 8);
        pdf.text(cell, xPos + 2, yPosition);
        xPos += colWidths[colIndex];
      });
      yPosition += 8;
    }

    // Sauvegarder le PDF
    pdf.save(`Enqueteurs_${formTitle}_${timestamp}.pdf`);
  };

  // Fonction d'export Word
  const exportToWord = async (formTitle, timestamp) => {
    const children = [];

    // Titre principal
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Rapport: ${formTitle}`,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Date d'export: ${timestamp}`,
            size: 20,
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total des réponses: ${filteredResponses.length}`,
            size: 20,
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Enquêteurs actifs: ${totalEnqueteurs}`,
            size: 20,
          }),
        ],
      })
    );

    children.push(new Paragraph({ text: "" }));

    // Générer le rapport pour chaque question
    formData.questions.forEach((question, index) => {
      const questionResponses = allParameterResponses.filter(
        (pr) => pr.parameter_libelle === question.label
      );

      // Titre de la question
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${question.label}`,
              bold: true,
              size: 24,
            }),
          ],
        })
      );

      // Type de question
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Type: ${question.type}`,
              size: 18,
            }),
          ],
        })
      );

      if (questionResponses.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${questionResponses.length} sur ${filteredResponses.length} répondants ont répondu`,
                size: 18,
              }),
            ],
          })
        );

        // Analyser les réponses
        let analysis = {};
        switch (question.type) {
          case "choix_unique":
          case "binaire":
            analysis = analyzeChoiceQuestion(questionResponses, question);
            break;
          case "choix_multiple":
            analysis = analyzeMultipleChoiceQuestion(questionResponses, question);
            break;
          case "texte":
          case "nombre_entier":
          case "nombre_decimal":
            analysis = analyzeTextQuestion(questionResponses, question);
            break;
          case "date":
          case "datetime":
            analysis = analyzeDateQuestion(questionResponses, question);
            break;
          default:
            analysis = analyzeGenericQuestion(questionResponses, question);
        }

        // Tableau des réponses
        if (analysis.data && analysis.data.length > 0) {
          const tableRows = [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "Valeur", bold: true })] }),
                  ],
                  width: { size: 60, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "Fréquence", bold: true })] }),
                  ],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "Pourcentage", bold: true })] }),
                  ],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ];

          analysis.data.forEach((item) => {
            // Garder le texte complet pour Word
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.label })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: item.value.toString() })] }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `${item.percentage}%` })] }),
                    ],
                  }),
                ],
              })
            );
          });

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Aucune réponse pour cette question",
                italic: true,
              }),
            ],
          })
        );
      }

      children.push(new Paragraph({ text: "" }));
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${formTitle}_Rapport_${timestamp}.docx`);
  };

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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
                  🏆 Classement des Enquêteurs
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  Analyse comparative des performances par enquêteur
                </MDTypography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Icon sx={{ color: "#fff" }}>picture_as_pdf</Icon>}
                onClick={() => exportEnqueteursPDF()}
                sx={{
                  borderRadius: 3,
                  minHeight: 48,
                  px: 3,
                  py: 1.5,
                  color: "#fff",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ee5a24 0%, #d63031 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
                    color: "#fff",
                  },
                }}
              >
                Télécharger PDF
              </Button>
            </Box>
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

      {/* Rapport Analytique Complet */}
      {selectedFormId && filteredResponses.length > 0 && (
        <MDBox py={1} mb={2} px={3}>
          <Box mb={2}>
            <MDTypography variant="h5" fontWeight="bold" color="primary" mb={1}>
              📊 Rapport Analytique Complet
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              Analyse détaillée de toutes les questions et réponses collectées
            </MDTypography>
          </Box>

          {/* Contrôles du rapport */}
          <Box className="selection-card" p={3} mb={3}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 20, color: "#fff" }}>assessment</Icon>
              </Box>
              <Box sx={{ flex: 1 }}>
                <MDTypography variant="h6" fontWeight="bold" color="primary" mb={0.5}>
                  🎛️ Contrôles du Rapport
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  Personnalisez l&apos;affichage et exportez vos données
                </MDTypography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Taille du graphique</InputLabel>
                <Select
                  value={chartSize}
                  onChange={(e) => setChartSize(e.target.value)}
                  label="Taille du graphique"
                  sx={{
                    minHeight: 56,
                    "& .MuiSelect-select": {
                      padding: "16px 20px",
                      fontSize: "14px",
                      fontWeight: 500,
                    },
                  }}
                >
                  <MenuItem value="small">Petit</MenuItem>
                  <MenuItem value="medium">Moyen</MenuItem>
                  <MenuItem value="large">Grand</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Type de graphique par défaut</InputLabel>
                <Select
                  value={defaultChartType}
                  onChange={(e) => setDefaultChartType(e.target.value)}
                  label="Type de graphique par défaut"
                  sx={{
                    minHeight: 56,
                    "& .MuiSelect-select": {
                      padding: "16px 20px",
                      fontSize: "14px",
                      fontWeight: 500,
                    },
                  }}
                >
                  <MenuItem value="pie">Secteur</MenuItem>
                  <MenuItem value="bar">Barres verticales</MenuItem>
                  <MenuItem value="horizontalBar">Barres horizontales</MenuItem>
                  <MenuItem value="doughnut">Anneau</MenuItem>
                  <MenuItem value="line">Ligne</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Icon sx={{ color: "#fff" }}>table_chart</Icon>}
                  onClick={() => exportReport("excel")}
                  sx={{
                    borderRadius: 3,
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    color: "#fff",
                    background: "linear-gradient(135deg, #00b894 0%, #00a085 100%)",
                    boxShadow: "0 4px 15px rgba(0, 184, 148, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #00a085 0%, #00a085 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0, 184, 148, 0.4)",
                      color: "#fff",
                    },
                  }}
                >
                  Excel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Icon sx={{ color: "#fff" }}>description</Icon>}
                  onClick={() => exportReport("word")}
                  sx={{
                    borderRadius: 3,
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    color: "#fff",
                    background: "linear-gradient(135deg, #0984e3 0%, #0652dd 100%)",
                    boxShadow: "0 4px 15px rgba(9, 132, 227, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0652dd 0%, #0652dd 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(9, 132, 227, 0.4)",
                      color: "#fff",
                    },
                  }}
                >
                  Word
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Zone de rapport avec défilement indépendant */}
          <Box
            className="table-container"
            sx={{
              height: "600px",
              overflowY: "auto",
              border: "2px solid #e2e8f0",
              borderRadius: 3,
              backgroundColor: "#fff",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              "&::-webkit-scrollbar": {
                width: "12px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "6px",
                "&:hover": {
                  background: "#a8a8a8",
                },
              },
            }}
          >
            <Box
              p={3}
              sx={{
                flex: 1,
                overflowY: "auto",
                minHeight: "100%",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f8f9fa",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#dee2e6",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#adb5bd",
                  },
                },
              }}
            >
              {loadingResponses ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {generateDetailedReport()}
                  {/* Espacement supplémentaire pour s'assurer que le défilement fonctionne */}
                  <Box
                    sx={{
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MDTypography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
                      Fin du rapport
                    </MDTypography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </MDBox>
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
