// FormHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Toolbar,
  TextField,
  IconButton,
  Button,
  Avatar,
  Paper,
  Modal,
  Typography,
  Radio,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import QuestionPage from "./question";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { fr } from "date-fns/locale";
import { formService } from "../../services/api";

import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

// --- Aperçu de la position (pour éviter les hooks dans le map) ---
function PositionPreview({ value }) {
  const [showMap, setShowMap] = React.useState(false);
  React.useEffect(() => {
    setShowMap(true);
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 220, flex: 1 }}>
        <TextField
          label="Latitude"
          value={value.lat}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Longitude"
          value={value.lng}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Précision (m)"
          value={value.precision}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          InputProps={{ readOnly: true }}
        />
      </Box>
      <Box sx={{ minWidth: 260, height: 180, flex: 1 }}>
        {showMap && typeof window !== "undefined" && value.lat && value.lng ? (
          <MapContainer
            center={[parseFloat(value.lat), parseFloat(value.lng)]}
            zoom={13}
            style={{ width: "100%", height: 180, borderRadius: 8 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[parseFloat(value.lat), parseFloat(value.lng)]} />
          </MapContainer>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 180,
              borderRadius: 8,
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontSize: 16,
            }}
          >
            Carte non disponible
          </Box>
        )}
      </Box>
    </Box>
  );
}

PositionPreview.propTypes = {
  value: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precision: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default function FormHeader() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [title, setTitle] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const fileInputRef = useRef(null);
  const [responses, setResponses] = useState({});

  // Sauvegarder l'état complet dans localStorage
  const saveFormState = (formState) => {
    // Ne sauvegarder que si on a des données valides à sauvegarder
    const stateToSave = {};

    if (formState.title !== undefined) {
      stateToSave.title = formState.title;
    } else if (title) {
      stateToSave.title = title;
    }

    if (formState.cover_image !== undefined) {
      stateToSave.cover_image = formState.cover_image;
    } else if (formImage !== null) {
      stateToSave.cover_image = formImage;
    }

    if (formState.description !== undefined) {
      stateToSave.description = formState.description;
    } else {
      const savedDescription = localStorage.getItem("formDescription");
      if (savedDescription !== null) {
        stateToSave.description = savedDescription;
      }
    }

    if (formState.questions !== undefined) {
      stateToSave.questions = formState.questions;
    } else {
      const savedQuestions = localStorage.getItem("formQuestions");
      if (savedQuestions !== null) {
        try {
          stateToSave.questions = JSON.parse(savedQuestions);
        } catch (error) {
          console.error("Erreur lors du parsing des questions dans saveFormState:", error);
        }
      }
    }

    // Ne sauvegarder que si on a au moins une propriété valide
    if (Object.keys(stateToSave).length > 0) {
      localStorage.setItem(`form_${formId || "new"}`, JSON.stringify(stateToSave));
      localStorage.setItem("formData", JSON.stringify(stateToSave));
      setHasUnsavedChanges(true);
    }
  };

  // Historique (undo/redo)
  const addToHistory = (state) => {
    const currentState = state || {
      title,
      image: formImage,
      description: localStorage.getItem("formDescription") || "",
      questions: JSON.parse(localStorage.getItem("formQuestions") || "[]"),
    };
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      newHistory.push(currentState);
      return newHistory;
    });
    setCurrentHistoryIndex((prev) => prev + 1);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      setTitle(previousState.title);
      setFormImage(previousState.image);
      localStorage.setItem("formDescription", previousState.description);
      localStorage.setItem("formQuestions", JSON.stringify(previousState.questions));
      setCurrentHistoryIndex((prev) => prev - 1);
      setHasUnsavedChanges(true);
    }
  };
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      setTitle(nextState.title);
      setFormImage(nextState.image);
      localStorage.setItem("formDescription", nextState.description);
      localStorage.setItem("formQuestions", JSON.stringify(nextState.questions));
      setCurrentHistoryIndex((prev) => prev + 1);
      setHasUnsavedChanges(true);
    }
  };

  // Charger le formulaire au démarrage
  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        setError(null);
        setInitialized(false); // Réinitialiser l'état d'initialisation

        // Si on a un formId (édition d'un formulaire existant), on charge TOUJOURS depuis l'API
        if (formId) {
          // Nettoyer le localStorage pour éviter les conflits avec d'anciennes données
          localStorage.removeItem(`form_${formId}`);
          localStorage.removeItem("formDescription");
          localStorage.removeItem("formQuestions");

          const response = await formService.getFormById(formId);

          if (!response || !response.success) {
            throw new Error(response?.message || "Erreur lors du chargement du formulaire");
          }
          const formData = response.data;
          // Affiche dans la console ce que l'API renvoie lors du chargement du formulaire
          console.log("[RECEPTION FORMULAIRE API] formData:", JSON.stringify(formData, null, 2));

          if (!formData || !formData.parameters) {
            throw new Error("Format de données invalide");
          }

          let questionIdCounter = 1;
          // Reconstruire la structure sections/questions avec support des cascades
          let questions = [];
          let lastSectionNo = null;
          let sectionOrder = 1;

          // Créer un map pour les relations parent-enfant des cascades
          const cascadeParentMap = new Map();

          formData.parameters
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach((param, idx) => {
              // Si on détecte une nouvelle section
              if (
                param.section_no !== undefined &&
                param.section_no !== null &&
                param.section_no !== lastSectionNo
              ) {
                questions.push({
                  id: `section_${param.section_no}_${Date.now()}_${idx}`,
                  label: param.section,
                  type: "section",
                  description: "",
                  active: false,
                  order: sectionOrder++,
                });
                lastSectionNo = param.section_no;
              }

              // Créer l'objet question
              const question = {
                id: param.id || `q_${questionIdCounter++}_${Date.now()}`,
                label: param.libelle,
                type: convertAPITypeToLocalType(param.type),
                required: param.is_required,
                options: [], // sera rempli juste après
                active: false,
                order: param.order || 1,
              };

              // Ajouter les informations de section
              if (param.section_no !== undefined && param.section_no !== null) {
                question.section_no = param.section_no;
              }
              if (param.section !== undefined && param.section !== null && param.section !== "") {
                question.section = param.section;
              }

              // Gérer les cascades : parent_parameter_libelle
              if (
                param.parent_parameter_libelle !== undefined &&
                param.parent_parameter_libelle !== null
              ) {
                // Stocker temporairement le libellé du parent pour le résoudre plus tard
                cascadeParentMap.set(question.id, param.parent_parameter_libelle);
              }

              // Gérer les modalités avec control_parameters et control_action
              if (Array.isArray(param.modalities) && param.modalities.length > 0) {
                // Pour les questions à choix, trie les modalités par order
                if (
                  [
                    "choix_unique",
                    "choix_multiple",
                    "select",
                    "multiselect",
                    "radio",
                    "checkbox",
                    "binaire",
                  ].includes(question.type)
                ) {
                  const sortedModalities = (param.modalities || [])
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                  question.options = sortedModalities.map((m) => m.libelle);
                  question.modalities = sortedModalities.map((modality, modIdx) => {
                    const mod = {
                      control_parameters: modality.control_parameters || [],
                      control_action: modality.control_action || "show",
                    };
                    if (
                      modality.parent_modality_libelle !== undefined &&
                      modality.parent_modality_libelle !== null
                    ) {
                      mod.parent_modality_libelle = modality.parent_modality_libelle;
                    }
                    return mod;
                  });
                } else {
                  question.options = param.modalities?.map((m) => m.libelle) || [];
                }
              }

              questions.push(question);
            });

          // Résoudre les relations parent-enfant des cascades
          cascadeParentMap.forEach((parentLibelle, questionId) => {
            const parentQuestion = questions.find((q) => q.label === parentLibelle);
            if (parentQuestion) {
              const question = questions.find((q) => q.id === questionId);
              if (question) {
                question.cascadeParent = parentQuestion.id;
              }
            }
          });

          // Si aucune section détectée, garder le comportement plat
          if (
            !formData.parameters.some((p) => p.section_no !== undefined && p.section_no !== null)
          ) {
            questions = formData.parameters
              .map((param) => {
                const question = {
                  id: param.id || `q_${questionIdCounter++}_${Date.now()}`,
                  label: param.libelle,
                  type: convertAPITypeToLocalType(param.type),
                  required: param.is_required,
                  options: [], // sera rempli juste après
                  active: false,
                  order: param.order || 1,
                };

                // Gérer les cascades
                if (
                  param.parent_parameter_libelle !== undefined &&
                  param.parent_parameter_libelle !== null
                ) {
                  const parentQuestion = questions.find(
                    (q) => q.label === param.parent_parameter_libelle
                  );
                  if (parentQuestion) {
                    question.cascadeParent = parentQuestion.id;
                  }
                }

                // Gérer les modalités
                if (Array.isArray(param.modalities) && param.modalities.length > 0) {
                  // Pour les questions à choix, trie les modalités par order
                  if (
                    [
                      "choix_unique",
                      "choix_multiple",
                      "select",
                      "multiselect",
                      "radio",
                      "checkbox",
                      "binaire",
                    ].includes(question.type)
                  ) {
                    const sortedModalities = (param.modalities || [])
                      .slice()
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    question.options = sortedModalities.map((m) => m.libelle);
                    question.modalities = sortedModalities.map((modality) => ({
                      control_parameters: modality.control_parameters || [],
                      control_action: modality.control_action || "show",
                      parent_modality_libelle: modality.parent_modality_libelle,
                    }));
                  } else {
                    question.options = param.modalities?.map((m) => m.libelle) || [];
                  }
                }

                return question;
              })
              .sort((a, b) => a.order - b.order);
          }

          const formState = {
            title: formData.title,
            cover_image: formData.cover_image,
            description: formData.description || "",
            questions: questions,
          };

          setTitle(formState.title);
          setFormImage(formState.cover_image);
          localStorage.setItem("formDescription", formState.description);
          localStorage.setItem("formQuestions", JSON.stringify(questions));

          // Sauvegarder l'état initial sans lire localStorage
          localStorage.setItem(`form_${formId}`, JSON.stringify(formState));
          localStorage.setItem("formData", JSON.stringify(formState));

          // Forcer un re-render du composant QuestionPage en déclenchant un événement
          window.dispatchEvent(new Event("storage"));
        } else {
          // Pour un nouveau formulaire, on nettoie COMPLÈTEMENT le localStorage de toute donnée précédente

          // Nettoyer TOUTES les clés liées aux formulaires
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              (key.startsWith("form_") ||
                key === "formDescription" ||
                key === "formQuestions" ||
                key === "formData")
            ) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
          });

          // Attendre un peu pour s'assurer que le nettoyage est terminé
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Puis on initialise avec une question par défaut
          const defaultQuestion = {
            id: 1,
            label: "Question exemple",
            type: "texte",
            required: false,
            options: [],
            active: true,
            order: 1,
          };

          const initialState = {
            title: "Nouveau formulaire",
            cover_image: null,
            description: "",
            questions: [defaultQuestion],
          };

          setTitle(initialState.title);
          setFormImage(initialState.cover_image);

          // Écrire les données de manière atomique
          localStorage.setItem("formDescription", initialState.description);
          localStorage.setItem("formQuestions", JSON.stringify(initialState.questions));
          localStorage.setItem("form_new", JSON.stringify(initialState));
          localStorage.setItem("formData", JSON.stringify(initialState));

          // Forcer un re-render du composant QuestionPage
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement du formulaire");
        setNotification({
          open: true,
          message: err.message || "Erreur lors du chargement du formulaire",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  // Ajouter un état pour suivre si l'initialisation est terminée
  const [initialized, setInitialized] = useState(false);

  // Marquer l'initialisation comme terminée après le premier chargement
  useEffect(() => {
    if (!loading && !initialized) {
      // Attendre un peu pour s'assurer que tout est bien initialisé
      setTimeout(() => {
        setInitialized(true);
      }, 200);
    }
  }, [loading, initialized]);

  // Sauvegarder les changements de titre (seulement après initialisation)
  useEffect(() => {
    if (!loading && initialized && title) {
      saveFormState({ title });
      addToHistory();
    }
  }, [title, loading, initialized]);

  // Sauvegarder les changements d'image (seulement après initialisation)
  useEffect(() => {
    if (!loading && initialized && formImage !== null) {
      saveFormState({ cover_image: formImage });
      addToHistory();
    }
  }, [formImage, loading, initialized]);

  // Sauvegarder les changements de questions (seulement après initialisation)
  useEffect(() => {
    const handleQuestionsChange = () => {
      if (!loading && initialized) {
        const questions = JSON.parse(localStorage.getItem("formQuestions") || "[]");
        saveFormState({ questions });
        addToHistory();
      }
    };
    window.addEventListener("storage", handleQuestionsChange);
    return () => window.removeEventListener("storage", handleQuestionsChange);
  }, [loading, initialized]);

  // Convertir les types de l'API vers les types locaux
  const convertAPITypeToLocalType = (apiType) => {
    const typeMapping = {
      texte: "texte",
      nombre_entier: "nombre_entier",
      nombre_decimal: "nombre_decimal",
      choix_unique: "choix_unique",
      choix_multiple: "choix_multiple",
      datetime: "datetime",
      date: "date",
      heure: "heure",
      media: "media",
      binaire: "binaire",
      position: "position",
      audio: "audio",
      video: "video",
      ligne: "ligne",
      note: "note",
      qrcode: "qrcode",
      consentir: "consentir",
      zone: "zone",
      tableau: "tableau",
      classement: "classement",
      calcul: "calcul",
      cache: "cache",
      fichier: "fichier",
      intervalle: "intervalle",
      xml: "xml",
    };

    return typeMapping[apiType] || "texte";
  };

  // Convertir les types locaux vers les types de l'API
  const convertLocalTypeToAPIType = (localType) => {
    const typeMapping = {
      texte: "texte",
      nombre_entier: "nombre_entier",
      nombre_decimal: "nombre_decimal",
      choix_unique: "choix_unique",
      choix_multiple: "choix_multiple",
      datetime: "datetime",
      date: "date",
      heure: "heure",
      media: "media",
      binaire: "binaire",
      position: "position",
      audio: "audio",
      video: "video",
      ligne: "ligne",
      note: "note",
      qrcode: "qrcode",
      consentir: "consentir",
      zone: "zone",
      tableau: "tableau",
      classement: "classement",
      calcul: "calcul",
      cache: "cache",
      fichier: "fichier",
      intervalle: "intervalle",
      xml: "xml",
    };

    return typeMapping[localType] || "texte";
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormImage(e.target.result);
        localStorage.setItem("formImage", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({
          open: true,
          message: "Veuillez vous connecter pour sauvegarder le formulaire",
          severity: "warning",
        });
        updateFormState({});
        return;
      }
      setLoading(true);
      const questions = JSON.parse(localStorage.getItem("formQuestions") || "[]");
      // Génération des parameters avec gestion des sections
      let sectionNo = 0;
      let currentSection = null;
      const parameters = [];
      questions.forEach((q, index) => {
        if (q.type === "section") {
          sectionNo += 1;
          currentSection = { section_no: sectionNo, section: q.label };
          return; // ne pas inclure la section elle-même
        }

        const param = {
          libelle: q.label,
          order: q.order || index + 1,
          type: convertLocalTypeToAPIType(q.type),
          is_required: q.required,
          modalities: [],
        };

        // Gérer les cascades : parent_parameter_libelle
        if (q.cascadeParent !== undefined && q.cascadeParent !== null) {
          const parentQuestion = questions.find((pq) => pq.id === q.cascadeParent);
          if (parentQuestion) {
            param.parent_parameter_libelle = parentQuestion.label;
          }
        }

        // Gérer les modalités pour les questions à choix
        if (
          [
            "choix_unique",
            "choix_multiple",
            "select",
            "multiselect",
            "radio",
            "checkbox",
            "binaire",
          ].includes(q.type)
        ) {
          if (Array.isArray(q.modalities) && q.modalities.length > 0) {
            // Utiliser les modalités existantes (pour les cascades)
            param.modalities = q.modalities.map((modality, i) => ({
              order: modality.order || i + 1,
              libelle: modality.libelle || q.options[i] || "",
              control_parameters: modality.control_parameters || [],
              control_condition: "ENABLE",
              ...(modality.parent_modality_libelle && {
                parent_modality_libelle: modality.parent_modality_libelle,
              }),
            }));
          } else {
            // Fallback vers les options simples
            param.modalities = (q.options || []).map((opt, i) => ({
              order: i + 1,
              libelle: opt,
              control_parameters: [],
              control_condition: "ENABLE",
            }));
          }
        }

        if (currentSection) {
          param.section_no = currentSection.section_no;
          param.section = currentSection.section;
        }
        parameters.push(param);
      });
      const formData = {
        title: title,
        description: localStorage.getItem("formDescription") || "",
        cover_image: formImage,
        parameters,
      };
      // Affiche dans la console ce qu'on envoie à l'API
      console.log("[ENVOI FORMULAIRE] formData:", JSON.stringify(formData, null, 2));
      let response;
      if (formId) {
        response = await formService.updateForm(formId, formData);
      } else {
        response = await formService.createForm(formData);
      }
      if (response.success) {
        if (!formId) {
          localStorage.removeItem("form_new");
          navigate(`/formulaire/${response.data.id}`);
        }
        setHasUnsavedChanges(false);
        setNotification({
          open: true,
          message: formId ? "Formulaire mis à jour avec succès" : "Formulaire créé avec succès",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setNotification({
          open: true,
          message:
            "Votre session a expiré. Veuillez vous reconnecter dans un nouvel onglet pour continuer.",
          severity: "warning",
        });
        updateFormState({});
      } else {
        setNotification({
          open: true,
          message: `Erreur: ${err.message || "Impossible de sauvegarder le formulaire"}`,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder dans localStorage à chaque modification
  const updateFormState = (updates = {}) => {
    const currentState = JSON.parse(localStorage.getItem(`form_${formId || "new"}`) || "{}");
    const currentQuestions = JSON.parse(localStorage.getItem("formQuestions") || "[]");
    const currentDescription = localStorage.getItem("formDescription") || "";
    const newState = {
      ...currentState,
      title: updates.title || title,
      cover_image: updates.cover_image || formImage,
      description: updates.description || currentDescription,
      questions: updates.questions || currentQuestions,
    };
    localStorage.setItem(`form_${formId || "new"}`, JSON.stringify(newState));
    localStorage.setItem(
      "formData",
      JSON.stringify({
        title: newState.title,
        image: newState.cover_image,
        description: newState.description,
        questions: newState.questions,
      })
    );
    setHasUnsavedChanges(true);
  };

  // Mettre à jour le localStorage à chaque changement
  useEffect(() => {
    if (!loading) {
      updateFormState({ title });
    }
  }, [title]);
  useEffect(() => {
    if (!loading && formImage !== null) {
      updateFormState({ cover_image: formImage });
    }
  }, [formImage]);
  useEffect(() => {
    const handleQuestionsChange = (event) => {
      if (!loading && event.key === "formQuestions") {
        const questions = JSON.parse(localStorage.getItem("formQuestions") || "[]");
        updateFormState({ questions });
      }
    };
    window.addEventListener("storage", handleQuestionsChange);
    return () => window.removeEventListener("storage", handleQuestionsChange);
  }, [loading]);

  const handlePreview = () => {
    const formData = {
      title,
      image: formImage,
      description: localStorage.getItem("formDescription") || "",
      questions: JSON.parse(localStorage.getItem("formQuestions") || "[]"),
    };
    localStorage.setItem("formData", JSON.stringify(formData));
    setPreviewOpen(true);
  };

  const renderPreview = () => {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          {formImage && (
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <img
                src={formImage}
                alt="form"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
          {/* Réduction de la taille du titre du formulaire */}
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", fontSize: "20px" }}>
            {title}
          </Typography>
          {/* Réduction de la taille de la description */}
          <Typography variant="body1" sx={{ mb: 4, color: "#666", fontSize: "14px" }}>
            {localStorage.getItem("formDescription") || ""}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {JSON.parse(localStorage.getItem("formQuestions") || "[]").map((question) => (
              <Box key={question.id}>
                {/* Réduction de la taille des questions */}
                <Typography variant="h6" sx={{ mb: 2, fontSize: "15px" }}>
                  {question.label}
                  {question.required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
                </Typography>
                {question.type === "texte" && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Votre réponse"
                    multiline
                    rows={2}
                  />
                )}
                {question.type === "nombre_entier" && (
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    placeholder="Entrez un nombre entier"
                    inputProps={{ step: 1 }}
                  />
                )}
                {question.type === "nombre_decimal" && (
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    placeholder="Entrez un nombre décimal"
                    inputProps={{ step: "any" }}
                  />
                )}
                {question.type === "binaire" && (
                  <RadioGroup>
                    {(question.options.length === 2 ? question.options : ["Oui", "Non"]).map(
                      (opt, idx) => (
                        <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
                      )
                    )}
                  </RadioGroup>
                )}
                {question.type === "choix_unique" && (
                  <RadioGroup>
                    {question.options.map((opt, idx) => (
                      <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
                    ))}
                  </RadioGroup>
                )}
                {question.type === "choix_multiple" && (
                  <FormGroup>
                    {question.options.map((opt, idx) => (
                      <FormControlLabel key={idx} control={<Checkbox />} label={opt} />
                    ))}
                  </FormGroup>
                )}
                {question.type === "datetime" && (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DateTimePicker
                      label="Sélectionnez une date et heure"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
                        actionBar: {
                          actions: ["accept", "cancel", "clear"],
                        },
                      }}
                      sx={{ "& .MuiInputBase-root": { backgroundColor: "white" } }}
                    />
                  </LocalizationProvider>
                )}
                {question.type === "media" && (
                  <Box sx={{ mt: 2 }}>
                    <input
                      accept="image/*,video/*"
                      style={{ display: "none" }}
                      id={`media-upload-${question.id}`}
                      type="file"
                    />
                    <label htmlFor={`media-upload-${question.id}`}>
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<AddPhotoAlternateIcon />}
                        fullWidth
                      >
                        Ajouter un média
                      </Button>
                    </label>
                  </Box>
                )}
                {question.type === "position" && (
                  <PositionPreview
                    value={
                      typeof responses[question.id] === "object" && responses[question.id] !== null
                        ? responses[question.id]
                        : {}
                    }
                  />
                )}
                {question.type === "tableau" && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Entrez une réponse (séparée par des virgules)"
                      multiline
                      rows={2}
                      value={responses[question.id] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [question.id]: e.target.value }))
                      }
                    />
                  </Box>
                )}
                {question.type === "classement" && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Entrez une réponse (séparée par des virgules)"
                      multiline
                      rows={2}
                      value={responses[question.id] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [question.id]: e.target.value }))
                      }
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          borderRadius: 0,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
          zIndex: 10,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100px",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            height: "100%",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img src="/favicon.png" alt="logo" style={{ width: 40, height: 40 }} />
            <TextField
              variant="standard"
              placeholder="Titre du formulaire"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputProps={{
                disableUnderline: false,
                sx: {
                  fontWeight: "bold",
                  fontSize: "18px",
                  minHeight: 45,
                  padding: "8px 14px 8px 20px",
                },
              }}
              sx={{ width: 250 }}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <IconButton
              sx={{
                backgroundColor: "#e0e0e0",
                borderRadius: "10px",
                width: 40,
                height: 40,
                overflow: "hidden",
                "&:hover": {
                  backgroundColor: "#000000",
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleImageClick}
            >
              {formImage ? (
                <img
                  src={formImage}
                  alt="form"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <AddPhotoAlternateIcon sx={{ color: "#666", fontSize: 28 }} />
              )}
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: "rgba(0,0,0,0.6)" }} onClick={handlePreview}>
              <VisibilityIcon />
            </IconButton>
            <IconButton
              sx={{
                color: currentHistoryIndex > 0 ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)",
                cursor: currentHistoryIndex > 0 ? "pointer" : "not-allowed",
              }}
              onClick={handleUndo}
              disabled={currentHistoryIndex <= 0}
            >
              <UndoIcon />
            </IconButton>
            <IconButton
              sx={{
                color:
                  currentHistoryIndex < history.length - 1 ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)",
                cursor: currentHistoryIndex < history.length - 1 ? "pointer" : "not-allowed",
              }}
              onClick={handleRedo}
              disabled={currentHistoryIndex >= history.length - 1}
            >
              <RedoIcon />
            </IconButton>
            <Button
              variant="contained"
              sx={{
                ml: 1,
                backgroundColor: "#77af0a", // vert app
                color: "#ffffff",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#689c09" }, // vert foncé app
              }}
              onClick={handleSave}
            >
              Enregistrer{hasUnsavedChanges ? " *" : ""}
            </Button>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#e0e0e0", width: 32, height: 32 }}>
              <PersonIcon sx={{ color: "black" }} />
            </Avatar>
          </Box>
        </Toolbar>
      </Paper>
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="preview-modal"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: 900,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            mt: 4,
            mb: 4,
          }}
        >
          {renderPreview()}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => setPreviewOpen(false)}
              sx={{ backgroundColor: "#000000", "&:hover": { backgroundColor: "#222222" } }}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      </Modal>
      <Box sx={{ px: 2, py: 12, maxWidth: 900, mx: "auto" }}>
        <QuestionPage title={title} onTitleChange={setTitle} parentLoading={loading} />
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
