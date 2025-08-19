import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  Paper,
  Button,
  Select,
  MenuItem,
  Switch,
  Slider,
  Input,
  Modal,
  Snackbar,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { DatePicker, TimePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { formService } from "../../services/api";

// Fonction pour générer un UUID v4
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Fonction pour vérifier si une question doit être affichée selon la logique d'affichage
const shouldShowQuestion = (question, formData, formValues) => {
  console.log("=== DEBUG shouldShowQuestion ===");
  console.log("Question à vérifier:", question.label);
  console.log("FormData:", formData);
  console.log("FormValues:", formValues);

  if (!formData || !formData.questions) {
    console.log("Pas de formData ou questions, affichage par défaut");
    return true;
  }

  // Vérifier si cette question est contrôlée par une autre question
  const controlQuestion = formData.questions.find(
    (q) =>
      q.modalities &&
      q.modalities.some(
        (mod) =>
          mod.control_parameters &&
          mod.control_parameters.some((param) => param.libelle === question.label)
      )
  );

  if (!controlQuestion) {
    console.log("Aucune question de contrôle trouvée, affichage par défaut");
    return true;
  }

  console.log("Question de contrôle trouvée:", controlQuestion.label);

  // Trouver les modalités qui contrôlent cette question
  const controllingModalities = controlQuestion.modalities.filter(
    (mod) =>
      mod.control_parameters &&
      mod.control_parameters.some((param) => param.libelle === question.label)
  );

  console.log("Modalités contrôlantes:", controllingModalities);

  // Vérifier si l'utilisateur a sélectionné une des modalités déclencheuses
  const selectedValue = formValues[controlQuestion.label];
  console.log("Valeur sélectionnée pour", controlQuestion.label, ":", selectedValue);

  if (!selectedValue) {
    console.log("Aucune valeur sélectionnée, question masquée");
    return false;
  }

  const shouldShow = controllingModalities.some((mod) => {
    // Gérer les tableaux et les chaînes
    const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
    return selectedValues.includes(mod.libelle) && mod.control_action === "ENABLE";
  });

  console.log("Question visible:", shouldShow);
  console.log("=== FIN DEBUG shouldShowQuestion ===");

  return shouldShow;
};

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

MapClickHandler.propTypes = {
  onClick: PropTypes.func.isRequired,
};

function PositionField({ value, onChange }) {
  const [position, setPosition] = React.useState({
    lat: value?.lat !== undefined && value?.lat !== "" ? parseFloat(value.lat) : 6.3703,
    lng: value?.lng !== undefined && value?.lng !== "" ? parseFloat(value.lng) : 2.3912,
    precision: value?.precision !== undefined && value?.precision !== "" ? value.precision : 10,
  });

  React.useEffect(() => {
    setPosition({
      lat: value?.lat !== undefined && value?.lat !== "" ? parseFloat(value.lat) : 6.3703,
      lng: value?.lng !== undefined && value?.lng !== "" ? parseFloat(value.lng) : 2.3912,
      precision: value?.precision !== undefined && value?.precision !== "" ? value.precision : 10,
    });
  }, [value]);

  const handleMapClick = (latlng) => {
    const newValue = {
      lat: latlng.lat,
      lng: latlng.lng,
      precision: 5,
    };
    setPosition(newValue);
    if (onChange) onChange(newValue);
  };

  const handleFieldChange = (field, val) => {
    const newValue = { ...position, [field]: val };
    setPosition(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
      <Box sx={{ minWidth: 220, flex: 1 }}>
        <TextField
          label="Latitude"
          value={position.lat}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("lat", parseFloat(e.target.value))}
        />
        <TextField
          label="Longitude"
          value={position.lng}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("lng", parseFloat(e.target.value))}
        />
        <TextField
          label="Précision (m)"
          value={position.precision}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("precision", e.target.value)}
        />
      </Box>
      <Box sx={{ minWidth: 260, height: 180, flex: 1 }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ width: "100%", height: 180, borderRadius: 8 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[position.lat, position.lng]} />
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </Box>
    </Box>
  );
}

PositionField.propTypes = {
  value: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precision: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onChange: PropTypes.func,
};

const Apercu = () => {
  const { id: paramId } = useParams();

  // Fallback pour récupérer l'ID depuis l'URL si useParams ne fonctionne pas
  const getFormId = () => {
    if (paramId) return paramId;

    // Extraire l'ID depuis l'URL
    const pathSegments = window.location.pathname.split("/");
    const formIndex = pathSegments.findIndex((segment) => segment === "form");
    if (formIndex !== -1 && pathSegments[formIndex + 1]) {
      return pathSegments[formIndex + 1];
    }

    return null;
  };

  const id = getFormId();

  console.log("ID récupéré:", { paramId, id, currentPath: window.location.pathname });

  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [formValues, setFormValues] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fonction pour mettre à jour les valeurs du formulaire
  const updateFormValue = (questionLabel, value) => {
    console.log("=== updateFormValue ===");
    console.log("questionLabel:", questionLabel);
    console.log("value:", value);
    console.log("formValues actuels:", formValues);

    setFormValues((prev) => {
      const newValues = { ...prev, [questionLabel]: value };
      console.log("Nouvelles formValues:", newValues);
      return newValues;
    });
  };

  // Fonction pour gérer les changements de réponses avec logique d'affichage
  const handleResponseChange = (questionId, value, questionLabel = null, type = null) => {
    console.log("=== handleResponseChange ===");
    console.log("questionId:", questionId);
    console.log("value:", value);
    console.log("questionLabel:", questionLabel);
    console.log("type:", type);

    // Mettre à jour les réponses
    setResponses((prev) => {
      if (type === "choix_multiple") {
        const currentValues = prev[questionId] || [];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [questionId]: currentValues.filter((v) => v !== value),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentValues, value],
          };
        }
      }
      return {
        ...prev,
        [questionId]: value,
      };
    });

    // Si questionLabel n'est pas fourni, essayer de le récupérer depuis formData
    if (!questionLabel && formData && formData.questions) {
      const question = formData.questions.find((q) => q.id === questionId);
      questionLabel = question ? question.label : null;
    }

    console.log("questionLabel final:", questionLabel);

    // Mettre à jour les valeurs du formulaire pour la logique d'affichage
    if (questionLabel) {
      console.log("Mise à jour formValues pour:", questionLabel, "avec valeur:", value);
      updateFormValue(questionLabel, value);
    }
  };
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userEmail, setUserEmail] = useState("");
  const [userLocation, setUserLocation] = useState({
    latitude: "",
    longitude: "",
  });

  // Debug: log quand l'ID change
  useEffect(() => {
    console.log("ID a changé:", id);
  }, [id]);

  useEffect(() => {
    console.log("useEffect fetchForm - ID:", id, "URL:", window.location.pathname);

    async function fetchForm() {
      if (id) {
        // Essaye d'abord le localStorage, sinon API
        let form = null;
        const saved = localStorage.getItem(`form_${id}`);
        if (saved) {
          try {
            form = JSON.parse(saved);
            console.log("=== DONNÉES DU LOCALSTORAGE ===");
            console.log("Données brutes localStorage:", saved);
            console.log("Données parsées localStorage:", form);
            console.log("Questions du localStorage:", form?.questions);
            console.log("=== FIN DONNÉES LOCALSTORAGE ===");
          } catch (e) {
            console.error("Erreur parsing localStorage:", e);
          }
        }

        if (!form) {
          try {
            console.log("Récupération du formulaire depuis l'API pour l'ID:", id);
            const res = await formService.getFormById(id);
            console.log("=== RÉPONSE COMPLÈTE DE L'API ===");
            console.log("Réponse API complète:", res);
            console.log("Status:", res?.status);
            console.log("Data:", res?.data);
            console.log("=== DONNÉES BRUTES DE L'API ===");
            console.log("Data brut (JSON.stringify):", JSON.stringify(res?.data, null, 2));
            console.log("=== FIN DONNÉES BRUTES ===");
            console.log("=== FIN RÉPONSE API ===");

            if (res && res.data) {
              const apiData = res.data;
              console.log("=== DONNÉES API PARSÉES ===");
              console.log("Titre:", apiData.title);
              console.log("Description:", apiData.description);
              console.log("Paramètres (questions):", apiData.parameters);
              console.log("Nombre de paramètres:", apiData.parameters?.length || 0);

              // Log détaillé de chaque paramètre
              if (apiData.parameters && Array.isArray(apiData.parameters)) {
                apiData.parameters.forEach((param, index) => {
                  console.log(`=== PARAMÈTRE ${index + 1} ===`);
                  console.log("ID:", param.id);
                  console.log("Libellé:", param.libelle);
                  console.log("Type:", param.type);
                  console.log("Required:", param.is_required);
                  console.log("Modalités:", param.modalities);
                  console.log("Options (libellés):", param.modalities?.map((m) => m.libelle) || []);
                  console.log("=== FIN PARAMÈTRE ${index + 1} ===");
                });
              }
              console.log("=== FIN DONNÉES API PARSÉES ===");

              form = {
                title: apiData.title,
                image: apiData.cover_image,
                description: apiData.description,
                questions: (apiData.parameters || []).map((param, idx) => ({
                  id: param.id || `q_${idx + 1}`,
                  label: param.libelle,
                  type: param.type,
                  required: param.is_required,
                  options: param.modalities?.map((m) => m.libelle) || [],
                  modalities: param.modalities || [], // Ajouter les modalités complètes avec leurs IDs
                  active: false,
                })),
              };

              // Sauvegarder en localStorage
              localStorage.setItem(`form_${id}`, JSON.stringify(form));
            }
          } catch (e) {
            console.error("Erreur lors de la récupération du formulaire:", e);
          }
        }

        if (form) {
          console.log("Formulaire chargé:", form);
          setFormData(form);
          // Initialiser les réponses
          const initialResponses = {};
          form.questions.forEach((q) => {
            initialResponses[q.id] = q.type === "choix_multiple" ? [] : "";
          });
          setResponses(initialResponses);
        } else {
          console.error("Aucun formulaire trouvé pour l'ID:", id);
        }
      } else {
        // Ancien comportement : localStorage 'formData'
        const savedForm = localStorage.getItem("formData");
        if (savedForm) {
          try {
            const form = JSON.parse(savedForm);
            setFormData(form);
            const initialResponses = {};
            form.questions.forEach((q) => {
              initialResponses[q.id] = q.type === "choix_multiple" ? [] : "";
            });
            setResponses(initialResponses);
          } catch (e) {
            console.error("Erreur parsing formData localStorage:", e);
          }
        }
      }
    }
    fetchForm();
  }, [id]);

  const formatValueForAPI = (value, questionType) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    switch (questionType) {
      case "choix_multiple":
        return Array.isArray(value) ? value.join(", ") : value;
      case "choix_unique":
      case "binaire":
        return String(value);
      case "date":
      case "datetime":
        return value instanceof Date ? value.toISOString() : value;
      case "position":
        return typeof value === "object" && value.lat && value.lng
          ? `${value.lat},${value.lng}`
          : value;
      case "tableau":
        return Array.isArray(value) ? JSON.stringify(value) : value;
      case "classement":
        return typeof value === "object" ? JSON.stringify(value) : value;
      default:
        return String(value);
    }
  };

  const handleSubmit = async () => {
    console.log("handleSubmit appelé avec:", { formData, id, responses });

    if (!formData) {
      console.error("formData est null ou undefined");
      setNotification({
        open: true,
        message: "Erreur: Données du formulaire non disponibles",
        severity: "error",
      });
      return;
    }

    if (!id) {
      console.error("ID du formulaire manquant");
      setNotification({
        open: true,
        message: "Erreur: ID du formulaire manquant",
        severity: "error",
      });
      return;
    }

    // Validation des champs requis
    const requiredQuestions = formData.questions.filter((q) => q.required);
    const missingFields = requiredQuestions.filter((q) => {
      const value = responses[q.id];
      return (
        !value ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
      );
    });

    if (missingFields.length > 0) {
      setNotification({
        open: true,
        message: `Veuillez remplir tous les champs obligatoires (${missingFields.length} manquant(s))`,
        severity: "warning",
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log("=== RÉPONSES BRUTES ===");
      console.log("Responses object:", responses);
      console.log("FormData questions:", formData.questions);
      console.log("=== FIN RÉPONSES BRUTES ===");

      // Préparer les paramètres pour l'API
      const parameters = formData.questions
        .map((question) => {
          const value = responses[question.id];
          const formattedValue = formatValueForAPI(value, question.type);

          // Pour les choix, on doit envoyer les IDs des modalités
          let modalities = [];
          if (
            question.type === "choix_multiple" ||
            question.type === "choix_unique" ||
            question.type === "binaire"
          ) {
            const selectedValues = Array.isArray(value) ? value : [value];
            console.log(`=== DEBUG MODALITÉS POUR QUESTION ${question.id} ===`);
            console.log("Type de question:", question.type);
            console.log("Valeurs sélectionnées:", selectedValues);
            console.log("Modalités de la question:", question.modalities);
            console.log("Options de la question:", question.options);

            modalities = selectedValues
              .filter((v) => v)
              .map((selectedLibelle) => {
                // Chercher la modalité correspondante par libellé
                if (question.modalities && Array.isArray(question.modalities)) {
                  const modality = question.modalities.find((m) => m.libelle === selectedLibelle);
                  console.log(`Recherche modalité pour "${selectedLibelle}":`, modality);
                  return modality ? modality.id : null;
                }

                // Si pas de modalités structurées, générer un ID basé sur l'index de l'option
                if (question.options && Array.isArray(question.options)) {
                  const optionIndex = question.options.findIndex((opt) => opt === selectedLibelle);
                  if (optionIndex !== -1) {
                    const generatedId = `mod_${question.id}_${optionIndex}`;
                    console.log(`Génération ID pour "${selectedLibelle}": ${generatedId}`);
                    return generatedId;
                  }
                }

                // Fallback si rien ne fonctionne
                console.log(
                  `Pas de modalités structurées, fallback sur libellé: "${selectedLibelle}"`
                );
                return selectedLibelle;
              })
              .filter((id) => id !== null);

            console.log("Modalités finales (IDs):", modalities);
            console.log("=== FIN DEBUG MODALITÉS ===");
          }

          return {
            parameter_id: question.id,
            value: formattedValue,
            modalities,
          };
        })
        .filter((param) => param.value !== "" || param.modalities.length > 0);

      const payload = {
        parameters,
        identifier: generateUUID(),
        email: userEmail || "utilisateur@example.com", // Email obligatoire
        ...(userLocation.longitude && { longitude: userLocation.longitude }),
        ...(userLocation.latitude && { latitude: userLocation.latitude }),
      };

      console.log("=== PAYLOAD ENVOYÉ À L'API ===");
      console.log("Payload complet:", JSON.stringify(payload, null, 2));
      console.log("Type de payload:", typeof payload);
      console.log("Parameters:", JSON.stringify(parameters, null, 2));
      console.log("Longitude:", payload.longitude);
      console.log("Latitude:", payload.latitude);
      console.log("Email:", payload.email);
      console.log("Identifier:", payload.identifier);
      console.log("=== FIN PAYLOAD ===");

      console.log("🚀🚀🚀 DONNÉES ENVOYÉES À L'API 🚀🚀🚀");
      console.log(payload);
      console.log("📋📋📋 FIN DONNÉES 📋📋📋");

      // Log détaillé de chaque paramètre
      console.log("=== DÉTAIL DES PARAMÈTRES ===");
      parameters.forEach((param, index) => {
        console.log(`Paramètre ${index + 1}:`, {
          parameter_id: param.parameter_id,
          value: param.value,
          modalities: param.modalities,
          type: typeof param.value,
        });
      });
      console.log("=== FIN DÉTAIL PARAMÈTRES ===");

      // Appel à l'API
      console.log("Appel API submitFormResponse avec ID:", id);
      console.log("URL de l'API:", `/api/forms/${id}/responses`);
      let response;
      try {
        response = await formService.submitFormResponse(id, payload);
        console.log("=== RÉPONSE API ===");
        console.log("Réponse complète:", response);
        console.log("Status:", response?.status);
        console.log("Success:", response?.success);
        console.log("Message:", response?.message);
        console.log("Data:", response?.data);
        console.log("=== FIN RÉPONSE ===");
      } catch (apiError) {
        console.log("=== ERREUR API ===");
        console.log("Erreur complète:", apiError);
        console.log("Message d'erreur:", apiError?.message);
        console.log("Status:", apiError?.response?.status);
        console.log("Response data:", apiError?.response?.data);
        console.log("Response headers:", apiError?.response?.headers);
        console.log("=== FIN ERREUR ===");
        throw apiError;
      }

      if (response && response.success) {
        setNotification({
          open: true,
          message: "Réponses envoyées avec succès !",
          severity: "success",
        });

        // Réinitialiser les réponses
        const initialResponses = {};
        formData.questions.forEach((q) => {
          initialResponses[q.id] = q.type === "choix_multiple" ? [] : "";
        });
        setResponses(initialResponses);
        setUserEmail("");
        setUserLocation({ latitude: "", longitude: "" });
      } else {
        throw new Error(response?.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des réponses:", error);
      setNotification({
        open: true,
        message: error?.response?.data?.message || "Erreur lors de l'envoi des réponses",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    console.log("=== renderQuestion ===");
    console.log("Question:", question);
    console.log("Question label:", question.label);

    switch (question.type) {
      case "texte":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Votre réponse"
          />
        );

      case "nombre_entier":
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Entrez un nombre entier"
            inputProps={{ step: 1 }}
          />
        );

      case "nombre_decimal":
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Entrez un nombre décimal"
            inputProps={{ step: "any" }}
          />
        );

      case "binaire":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
          >
            {(question.options.length === 2 ? question.options : ["Oui", "Non"]).map((opt, idx) => (
              <FormControlLabel
                key={idx}
                value={opt}
                control={<Radio />}
                label={opt}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "1rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        );

      case "choix_unique":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
          >
            {question.options.map((opt, idx) => (
              <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        );

      case "choix_multiple":
        return (
          <Box>
            {question.options.map((opt, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={(responses[question.id] || []).includes(opt)}
                    onChange={() =>
                      handleResponseChange(question.id, opt, question.label, "choix_multiple")
                    }
                  />
                }
                label={opt}
              />
            ))}
          </Box>
        );

      case "liste_deroulante":
        return (
          <Select
            fullWidth
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Sélectionner une option
            </MenuItem>
            {question.options.map((opt, idx) => (
              <MenuItem key={idx} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        );

      case "media":
      case "fichier":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier
            <Input
              type="file"
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0], question.label)}
            />
          </Button>
        );

      case "datetime":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label="Sélectionnez une date et heure"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value, question.label)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "date":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Sélectionnez une date"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value, question.label)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "heure":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TimePicker
              label="Sélectionnez une heure"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value, question.label)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "note":
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={3}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Votre note"
          />
        );

      case "ligne":
        return <Box sx={{ borderTop: "2px solid #77af0a", my: 2 }} />;

      case "zone":
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={4}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Votre zone de texte"
          />
        );

      case "tableau":
        // Affiche le tableau configuré avec les types de lignes
        const rows = question.rows || ["Ligne 1"];
        const columns = question.columns || ["Colonne 1", "Colonne 2"];

        const getRowType = (rowIndex) => {
          return (question.rowTypes && question.rowTypes[rowIndex]) || "texte";
        };

        const getRowOptions = (rowIndex) => {
          return (question.rowOptions && question.rowOptions[rowIndex]) || [];
        };

        const handleTableCellChange = (rowIdx, colIdx, value) => {
          const table = responses[question.id] || {};
          if (!table[rowIdx]) table[rowIdx] = {};
          table[rowIdx][colIdx] = value;
          handleResponseChange(question.id, table, question.label);
        };

        const renderTableCell = (rowIdx, colIdx, rowType) => {
          const value = responses[question.id]?.[rowIdx]?.[colIdx] || "";

          switch (rowType) {
            case "texte":
              return (
                <TextField
                  size="small"
                  variant="outlined"
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  placeholder="Texte"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      "& fieldset": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#77af0a",
                      },
                    },
                  }}
                />
              );
            case "nombre_entier":
              return (
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  placeholder="Nombre"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      "& fieldset": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#77af0a",
                      },
                    },
                  }}
                />
              );
            case "nombre_decimal":
              return (
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  placeholder="Nombre décimal"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      "& fieldset": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#77af0a",
                      },
                    },
                  }}
                />
              );
            case "binaire":
              const binaireOptions = getRowOptions(rowIdx);
              return (
                <RadioGroup
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  row
                >
                  {binaireOptions.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              );
            case "choix_unique":
              const uniqueOptions = getRowOptions(rowIdx);
              return (
                <Select
                  size="small"
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  displayEmpty
                  fullWidth
                  sx={{
                    fontSize: "14px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#77af0a",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Choisir
                  </MenuItem>
                  {uniqueOptions.map((opt, idx) => (
                    <MenuItem key={idx} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              );
            case "choix_multiple":
              const multipleOptions = getRowOptions(rowIdx);
              const currentValues = Array.isArray(value) ? value : [];
              return (
                <Box>
                  {multipleOptions.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          size="small"
                          checked={currentValues.includes(opt)}
                          onChange={(e) => {
                            const newValues = e.target.checked
                              ? [...currentValues, opt]
                              : currentValues.filter((v) => v !== opt);
                            handleTableCellChange(rowIdx, colIdx, newValues);
                          }}
                        />
                      }
                      label={opt}
                      sx={{ fontSize: "12px" }}
                    />
                  ))}
                </Box>
              );
            default:
              return (
                <TextField
                  size="small"
                  variant="outlined"
                  value={value}
                  onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                  placeholder="Votre réponse"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      "& fieldset": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#77af0a",
                      },
                    },
                  }}
                />
              );
          }
        };

        return (
          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                border: "2px solid #e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: 600,
              }}
            >
              {/* En-têtes du tableau */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `200px repeat(${columns.length}, 1fr)`,
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {/* Cellule vide en haut à gauche */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRight: "1px solid #e2e8f0",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  &nbsp;
                </Box>
                {/* En-têtes des colonnes */}
                {columns.map((col, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      backgroundColor: "#f8fafc",
                      borderRight: idx < columns.length - 1 ? "1px solid #e2e8f0" : "none",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {col}
                  </Box>
                ))}
              </Box>

              {/* Lignes du tableau */}
              {rows.map((row, rowIdx) => (
                <Box
                  key={rowIdx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `200px repeat(${columns.length}, 1fr)`,
                    borderBottom: rowIdx < rows.length - 1 ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  {/* Libellé de la ligne */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#f8fafc",
                      borderRight: "1px solid #e2e8f0",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {row}
                  </Box>

                  {/* Cellules de données */}
                  {columns.map((col, colIdx) => (
                    <Box
                      key={colIdx}
                      sx={{
                        p: 2,
                        borderRight: colIdx < columns.length - 1 ? "1px solid #e2e8f0" : "none",
                        backgroundColor: "#fff",
                        minHeight: 60,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {renderTableCell(rowIdx, colIdx, getRowType(rowIdx))}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "classement":
        // Affiche une liste ordonnable simple (drag & drop non implémenté, mais champs de classement)
        return (
          <Box>
            {(question.options && question.options.length > 0
              ? question.options
              : ["Option 1", "Option 2", "Option 3"]
            ).map((opt, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TextField
                  type="number"
                  size="small"
                  variant="outlined"
                  value={
                    responses[question.id]?.[opt] !== undefined
                      ? responses[question.id][opt]
                      : idx + 1
                  }
                  onChange={(e) => {
                    const newValue = {
                      ...(responses[question.id] || {}),
                      [opt]: e.target.value,
                    };
                    handleResponseChange(question.id, newValue, question.label);
                  }}
                  sx={{ width: 60, mr: 2 }}
                  inputProps={{ min: 1, max: 10 }}
                />
                <Typography>{opt}</Typography>
              </Box>
            ))}
          </Box>
        );

      case "calcul":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Champ calculé (saisi pour l'aperçu)"
          />
        );

      case "intervalle":
        return (
          <Box sx={{ px: 2 }}>
            <Slider
              value={typeof responses[question.id] === "number" ? responses[question.id] : 0}
              onChange={(_, value) => handleResponseChange(question.id, value, question.label)}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case "xml":
        // Champ texte multilignes pour saisir du XML
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={4}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Saisir du XML ici..."
          />
        );

      case "cache":
        return (
          <Switch
            checked={!!responses[question.id]}
            onChange={(e) => handleResponseChange(question.id, e.target.checked, question.label)}
          />
        );

      case "qrcode":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Scanner ou saisir le code barre/QR"
          />
        );

      case "consentir":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!responses[question.id]}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.checked, question.label)
                }
              />
            }
            label="Je consens"
          />
        );

      case "audio":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier audio
            <Input
              type="file"
              inputProps={{ accept: "audio/*" }}
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0], question.label)}
            />
          </Button>
        );

      case "video":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier vidéo
            <Input
              type="file"
              inputProps={{ accept: "video/*" }}
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0], question.label)}
            />
          </Button>
        );

      case "position":
        // On stocke la valeur comme un objet {lat, lng, precision}
        const posValue =
          typeof responses[question.id] === "object" && responses[question.id] !== null
            ? responses[question.id]
            : {};
        return (
          <PositionField
            value={posValue}
            onChange={(newValue) => handleResponseChange(question.id, newValue, question.label)}
          />
        );

      default:
        // Fallback pour type inconnu ou vide
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.label)}
            placeholder="Votre réponse"
          />
        );
    }
  };

  return (
    <>
      {/* Contenu principal de l'aperçu (toujours visible) */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
        {formData && (
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 0,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              overflow: "hidden",
            }}
          >
            {/* Header du formulaire */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #77af0a 0%, #52734d 100%)",
                p: 4,
                color: "#ffffff",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
                  opacity: 0.3,
                },
              }}
            >
              {formData.image && (
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <img
                    src={formData.image}
                    alt="form"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                      borderRadius: 12,
                      border: "3px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </Box>
              )}
              <Typography
                variant="h3"
                sx={{
                  mb: 2,
                  fontWeight: "800",
                  fontSize: "32px",
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                }}
              >
                {formData.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "18px",
                  lineHeight: 1.6,
                  textAlign: "center",
                  opacity: 0.9,
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                {formData.description}
              </Typography>
            </Box>

            {/* Contenu du formulaire */}
            <Box sx={{ p: 6, backgroundColor: "#ffffff" }}>
              {/* Questions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {formData.questions.map((question, index) => {
                  // Vérifier si la question doit être affichée selon la logique d'affichage
                  const isVisible = shouldShowQuestion(question, formData, formValues);

                  if (!isVisible) return null;

                  return (
                    <Box
                      key={question.id}
                      sx={{
                        position: "relative",
                        p: 4,
                        borderRadius: 3,
                        border: "2px solid #f8fafc",
                        backgroundColor: "#ffffff",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          transform: "translateY(-1px)",
                        },
                        "&::before": {
                          content: `"${index + 1}"`,
                          position: "absolute",
                          top: -12,
                          left: 20,
                          backgroundColor: "#77af0a",
                          color: "#ffffff",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          zIndex: 1,
                        },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 3,
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#1e293b",
                          lineHeight: 1.3,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {question.label}
                        {question.required && (
                          <Chip
                            label="Obligatoire"
                            size="small"
                            sx={{
                              backgroundColor: "#fef2f2",
                              color: "#dc2626",
                              fontSize: "11px",
                              height: "24px",
                              fontWeight: "600",
                              border: "1px solid #fecaca",
                            }}
                          />
                        )}
                      </Typography>
                      {renderQuestion(question)}
                    </Box>
                  );
                })}
              </Box>

              {/* Informations utilisateur */}
              <Box
                sx={{
                  mt: 6,
                  p: 4,
                  backgroundColor: "#f8fafc",
                  borderRadius: 3,
                  border: "2px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#1e293b",
                    fontWeight: "700",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📋 Vos informations
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    label="Email (optionnel)"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    type="email"
                    sx={{ minWidth: 250, flex: 1 }}
                    size="small"
                    variant="outlined"
                  />
                  <TextField
                    label="Latitude (optionnel)"
                    value={userLocation.latitude}
                    onChange={(e) =>
                      setUserLocation((prev) => ({ ...prev, latitude: e.target.value }))
                    }
                    type="number"
                    sx={{ minWidth: 150 }}
                    size="small"
                    variant="outlined"
                  />
                  <TextField
                    label="Longitude (optionnel)"
                    value={userLocation.longitude}
                    onChange={(e) =>
                      setUserLocation((prev) => ({ ...prev, longitude: e.target.value }))
                    }
                    type="number"
                    sx={{ minWidth: 150 }}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Footer avec bouton d'envoi */}
              <Box
                sx={{
                  mt: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 3,
                  backgroundColor: "#f8fafc",
                  borderRadius: 3,
                  border: "2px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📝 {formData.questions.filter((q) => q.required).length} champ(s) obligatoire(s)
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    background: "linear-gradient(135deg, #77af0a 0%, #52734d 100%)",
                    borderRadius: "12px",
                    px: 4,
                    py: 1.5,
                    fontWeight: "600",
                    fontSize: "16px",
                    minWidth: 180,
                    boxShadow: "0 4px 12px rgba(119, 175, 10, 0.3)",
                    transition: "all 0.3s ease",
                    color: "#ffffff",
                    "&:hover": {
                      background: "linear-gradient(135deg, #6a991f 0%, #4a643c 100%)",
                      boxShadow: "0 6px 20px rgba(119, 175, 10, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: "#e2e8f0",
                      color: "#94a3b8",
                    },
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                      Envoi...
                    </>
                  ) : (
                    "📤 Envoyer les réponses"
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
      {/* Modal d'aperçu stylisé, superposé */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="preview-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
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
            p: 0,
            mt: 4,
            mb: 4,
          }}
        >
          {/* Header vert fidèle au design */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#77af0a",
              color: "#fff",
              height: 56,
              px: 3,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottom: "4px solid #e65100",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <img
                src="/favicon.png"
                alt="logo"
                style={{ width: 32, height: 32, marginRight: 12 }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}
              >
                Aperçu du formulaire
              </Typography>
            </Box>
            <Button
              onClick={() => setPreviewOpen(false)}
              sx={{ color: "#fff", minWidth: 0, p: 0, ml: 2 }}
            >
              <span style={{ fontSize: 28, fontWeight: "bold" }}>&times;</span>
            </Button>
          </Box>
          <Box sx={{ p: 4 }}>
            {/* contenu de l'aperçu dans le modal */}
            {formData && (
              <>
                {formData.image && (
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <img
                      src={formData.image}
                      alt="form"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                  {formData.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
                  {formData.description}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {formData.questions.map((question, index) => (
                    <Box key={question.id}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {question.label}
                        {question.required && (
                          <span style={{ color: "red", marginLeft: 4 }}>*</span>
                        )}
                      </Typography>
                      {renderQuestion(question)}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={() => setPreviewOpen(false)}
                    sx={{
                      backgroundColor: "#77af0a",
                      "&:hover": {
                        backgroundColor: "#689c09",
                      },
                    }}
                  >
                    Fermer
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Apercu;
