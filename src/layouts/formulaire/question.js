import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Switch,
  InputAdornment,
  Tooltip,
  Modal,
  Grid,
  Paper,
  Button,
  FormControl,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import ViewListIcon from "@mui/icons-material/ViewList";
import NoteIcon from "@mui/icons-material/Note";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SubjectIcon from "@mui/icons-material/Subject";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import NumbersIcon from "@mui/icons-material/Numbers";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import TimelineIcon from "@mui/icons-material/Timeline";
import QrCodeIcon from "@mui/icons-material/QrCode";
import GavelIcon from "@mui/icons-material/Gavel";
import GridOnIcon from "@mui/icons-material/GridOn";
import SortIcon from "@mui/icons-material/Sort";
import CalculateIcon from "@mui/icons-material/Calculate";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import CodeIcon from "@mui/icons-material/Code";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import * as XLSX from "xlsx";

const questionTypes = [
  { value: "texte", label: "Texte", icon: <TextFieldsIcon /> },
  {
    value: "nombre_entier",
    label: "Nombre entier",
    icon: <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>123</span>,
  },
  {
    value: "nombre_decimal",
    label: "Nombre décimal",
    icon: <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>1.0</span>,
  },
  { value: "binaire", label: "Binaire", icon: <ToggleOnIcon /> },
  { value: "media", label: "Media", icon: <PermMediaIcon /> },
  { value: "datetime", label: "Date et heure", icon: <AccessTimeIcon /> },
  { value: "date", label: "Date", icon: <CalendarTodayIcon /> },
  { value: "heure", label: "Heure", icon: <ScheduleIcon /> },
  { value: "position", label: "Position", icon: <LocationOnIcon /> },
  { value: "audio", label: "Audio", icon: <MicIcon /> },
  { value: "video", label: "Vidéo", icon: <VideocamIcon /> },
  { value: "ligne", label: "Ligne", icon: <TimelineIcon /> },
  { value: "note", label: "Note", icon: <NoteIcon /> },
  { value: "qrcode", label: "Code barre/QR", icon: <QrCodeIcon /> },
  { value: "zone", label: "Zone", icon: <ViewListIcon /> },
  { value: "tableau", label: "Tableau de questions", icon: <GridOnIcon /> },
  { value: "classement", label: "Classement", icon: <SortIcon /> },
  { value: "fichier", label: "Fichier", icon: <AttachFileIcon /> },
  { value: "choix_unique", label: "Choix unique", icon: <RadioButtonCheckedIcon /> },
  { value: "choix_multiple", label: "Choix Multiple", icon: <CheckBoxIcon /> },
];

const typeIcons = {
  texte: <TextFieldsIcon fontSize="small" sx={{ mr: 1 }} />,
  nombre_entier: (
    <span style={{ fontSize: "1rem", fontWeight: "bold", marginRight: "8px" }}>123</span>
  ),
  nombre_decimal: (
    <span style={{ fontSize: "1rem", fontWeight: "bold", marginRight: "8px" }}>1.0</span>
  ),
  binaire: <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />,
  media: <PermMediaIcon fontSize="small" sx={{ mr: 1 }} />,
  datetime: <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />,
  date: <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />,
  heure: <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />,
  position: <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />,
  audio: <MicIcon fontSize="small" sx={{ mr: 1 }} />,
  video: <VideocamIcon fontSize="small" sx={{ mr: 1 }} />,
  ligne: <TimelineIcon fontSize="small" sx={{ mr: 1 }} />,
  note: <NoteIcon fontSize="small" sx={{ mr: 1 }} />,
  qrcode: <QrCodeIcon fontSize="small" sx={{ mr: 1 }} />,
  zone: <ViewListIcon fontSize="small" sx={{ mr: 1 }} />,
  tableau: <GridOnIcon fontSize="small" sx={{ mr: 1 }} />,
  classement: <SortIcon fontSize="small" sx={{ mr: 1 }} />,
  fichier: <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />,
  choix_unique: <RadioButtonCheckedIcon fontSize="small" sx={{ mr: 1 }} />,
  choix_multiple: <CheckBoxIcon fontSize="small" sx={{ mr: 1 }} />,
};

const QuestionPage = ({ title, onTitleChange, parentLoading = false }) => {
  const [description, setDescription] = useState("Description du formulaire");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      label: "Question exemple",
      type: "texte",
      required: false,
      options: [],
      active: true,
      order: 1,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [clipboard, setClipboard] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [cascadeModalOpen, setCascadeModalOpen] = useState(false);
  const [cascadeTargetQuestionId, setCascadeTargetQuestionId] = useState(null);
  const [cascadeText, setCascadeText] = useState("");
  const [cascadeFile, setCascadeFile] = useState(null);
  const [cascadeFileName, setCascadeFileName] = useState("");
  const [cascadeInputMode, setCascadeInputMode] = useState("text"); // "text" ou "file"

  // Écouter les changements du localStorage pour synchroniser les données
  useEffect(() => {
    // Attendre que le parent ait fini de charger avant de lire localStorage
    if (parentLoading) {
      return;
    }

    const handleStorageChange = () => {
      const savedDescription = localStorage.getItem("formDescription");
      const savedQuestions = localStorage.getItem("formQuestions");

      if (savedDescription !== null) {
        setDescription(savedDescription);
      }

      if (savedQuestions !== null) {
        try {
          const parsed = JSON.parse(savedQuestions);
          setQuestions(parsed);
          setIsLoading(false);
        } catch (error) {
          // Si erreur de parsing, on garde l'état par défaut
          console.error("Erreur lors du parsing des questions:", error);
          setIsLoading(false);
        }
      } else {
        // Si pas de questions dans localStorage, on garde l'état par défaut
        setIsLoading(false);
      }
    };

    // Écouter les événements de stockage
    window.addEventListener("storage", handleStorageChange);

    // Vérifier immédiatement au montage
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [parentLoading]);

  // Gérer le changement de parentLoading de true à false
  useEffect(() => {
    if (!parentLoading && isLoading) {
      // Attendre un peu pour s'assurer que FormHeader a fini d'écrire dans localStorage
      setTimeout(() => {
        const savedDescription = localStorage.getItem("formDescription");
        const savedQuestions = localStorage.getItem("formQuestions");

        if (savedDescription !== null) {
          setDescription(savedDescription);
        }

        if (savedQuestions !== null) {
          try {
            const parsed = JSON.parse(savedQuestions);
            setQuestions(parsed);
          } catch (error) {
            console.error("Erreur lors du parsing des questions:", error);
          }
        }

        setIsLoading(false);
      }, 100);
    }
  }, [parentLoading, isLoading]);

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "c":
            event.preventDefault();
            if (selectedQuestions.size > 0) {
              copySelectedQuestions();
            }
            break;
          case "v":
            event.preventDefault();
            pasteQuestions();
            break;
          case "a":
            event.preventDefault();
            selectAllQuestions();
            break;
          case "Escape":
            event.preventDefault();
            clearSelection();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedQuestions, clipboard, questions]);

  // Synchroniser questions et description avec localStorage à chaque modification
  // Mais seulement si on n'est pas en train de charger initialement
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("formQuestions", JSON.stringify(questions));
    }
  }, [questions, isLoading]);
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("formDescription", description);
    }
  }, [description, isLoading]);

  const setActiveQuestion = (id) => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        active: q.id === id,
      }))
    );
  };

  // Ajoute une nouvelle question juste après la question dont l'id est passé en paramètre
  const addNewQuestion = (afterId) => {
    const newId = `q_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const newQuestion = {
      id: newId,
      label: "",
      type: "texte",
      required: false,
      options: [],
      active: true,
      order: 0, // sera recalculé
    };
    setQuestions((prev) => {
      // Désactive toutes les questions
      const updatedPrev = prev.map((q) => ({ ...q, active: false }));
      const idx = updatedPrev.findIndex((q) => q.id === afterId);
      let newArr;
      if (idx === -1) {
        newArr = [...updatedPrev, newQuestion];
      } else {
        newArr = [...updatedPrev.slice(0, idx + 1), newQuestion, ...updatedPrev.slice(idx + 1)];
      }
      // Recalcule l'ordre
      return newArr.map((q, i) => ({ ...q, order: i + 1 }));
    });
    setTimeout(() => {
      const element = document.getElementById(`question-${newId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const updateLabel = (id, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label: value } : q)));
  };

  const updateType = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          let options = q.options;
          if (["choix_unique", "choix_multiple", "liste_deroulante"].includes(value)) {
            if (!Array.isArray(options) || options.length === 0) {
              options = ["Option 1"];
            }
          } else if (value === "binaire") {
            options = ["Oui", "Non"];
          } else {
            options = [];
          }
          return {
            ...q,
            type: value,
            options,
            ...(value === "tableau"
              ? {
                  rows: q.rows && Array.isArray(q.rows) ? q.rows : ["Ligne 1"],
                  columns:
                    q.columns && Array.isArray(q.columns) ? q.columns : ["Colonne 1", "Colonne 2"],
                }
              : {}),
          };
        }
        return q;
      })
    );
    setTypeModalOpen(false);
    setSelectedQuestionId(null);
  };

  const openTypeModal = (questionId) => {
    setSelectedQuestionId(questionId);
    setTypeModalOpen(true);
  };

  const closeTypeModal = () => {
    setTypeModalOpen(false);
    setSelectedQuestionId(null);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const selectAllQuestions = () => {
    const allIds = questions.map((q) => q.id);
    setSelectedQuestions(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const copySelectedQuestions = () => {
    const questionsToCopy = questions.filter((q) => selectedQuestions.has(q.id));
    setClipboard(questionsToCopy);
    console.log("Questions copiées:", questionsToCopy.length);
  };

  const pasteQuestions = () => {
    if (clipboard.length === 0) return;
    const newQuestions = clipboard.map((q, index) => ({
      ...q,
      id: `q_${Date.now()}_${Math.floor(Math.random() * 100000)}_${index}`,
      active: false,
      order: questions.length + index + 1,
    }));
    // Rends la dernière question collée active, désactive toutes les autres
    if (newQuestions.length > 0) {
      newQuestions[newQuestions.length - 1].active = true;
    }
    setQuestions((prev) => [...prev.map((q) => ({ ...q, active: false })), ...newQuestions]);
    clearSelection();
    console.log("Questions collées:", newQuestions.length);
  };

  const updateOptionText = (qId, idx, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === idx ? value : opt)),
            }
          : q
      )
    );
  };

  const addOption = (id, isOther = false) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: [...q.options, isOther ? "Autre" : `Option ${q.options.length + 1}`],
            }
          : q
      )
    );
  };

  const deleteOption = (qId, idx) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== idx),
            }
          : q
      )
    );
  };

  const deleteQuestion = (id) => {
    if (questions.length <= 1) {
      return;
    }
    setQuestions((prev) => {
      let filtered = prev.filter((q) => q.id !== id);
      if (!filtered.some((q) => q.active) && filtered.length) filtered[0].active = true;
      return filtered;
    });
  };

  const copyQuestion = (id) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      if (index === -1) return prev;
      const newId = `q_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const copy = {
        ...prev[index],
        id: newId,
        active: true,
        order: prev.length + 1,
      };
      // Désactive toutes les autres questions
      const newQuestions = prev.map((q) => ({ ...q, active: false })).concat(copy);
      return newQuestions;
    });
  };

  const toggleRequired = (id) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q)));
  };

  // Ajoute une question juste après une section, indentée (dans la section)
  const addQuestionInSection = (sectionId) => {
    // Trouver l'index de la section
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === sectionId);
      if (idx === -1) return prev;
      // Chercher la prochaine section ou la fin
      let insertIdx = idx + 1;
      while (insertIdx < prev.length && prev[insertIdx].type !== "section") {
        insertIdx++;
      }
      // Insérer juste après la section, avant la prochaine section
      const newId = `q_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const newQuestion = {
        id: newId,
        label: "",
        type: "texte",
        required: false,
        options: [],
        active: true,
        order: 0,
      };
      const updatedPrev = prev.map((q) => ({ ...q, active: false }));
      const newArr = [
        ...updatedPrev.slice(0, idx + 1),
        newQuestion,
        ...updatedPrev.slice(idx + 1, insertIdx),
        ...updatedPrev.slice(insertIdx),
      ];
      return newArr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  // Ajoute une question juste après la section, mais hors section (non indentée)
  const addQuestionAfterSection = (sectionId) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === sectionId);
      if (idx === -1) return prev;
      // Chercher la prochaine section ou la fin
      let insertIdx = idx + 1;
      while (insertIdx < prev.length && prev[insertIdx].type !== "section") {
        insertIdx++;
      }
      // Insérer juste après la dernière question de la section (avant la prochaine section)
      const newId = `q_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const newQuestion = {
        id: newId,
        label: "",
        type: "texte",
        required: false,
        options: [],
        active: true,
        order: 0,
      };
      const updatedPrev = prev.map((q) => ({ ...q, active: false }));
      const newArr = [
        ...updatedPrev.slice(0, insertIdx),
        newQuestion,
        ...updatedPrev.slice(insertIdx),
      ];
      return newArr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  // Ajoute une section juste après une section ou une question
  const addSectionAfter = (afterId) => {
    const newId = `section_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const newSection = {
      id: newId,
      type: "section",
      label: "Nouvelle section",
      description: "",
      active: false,
      order: 0,
    };
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === afterId);
      if (idx === -1) return [...prev, newSection];
      // Si afterId est une section, insérer après toutes les questions de la section
      if (prev[idx].type === "section") {
        let insertIdx = idx + 1;
        while (insertIdx < prev.length && prev[insertIdx].type !== "section") {
          insertIdx++;
        }
        const newArr = [...prev.slice(0, insertIdx), newSection, ...prev.slice(insertIdx)];
        return newArr.map((q, i) => ({ ...q, order: i + 1 }));
      } else {
        // Si afterId est une question, insérer juste après
        const newArr = [...prev.slice(0, idx + 1), newSection, ...prev.slice(idx + 1)];
        return newArr.map((q, i) => ({ ...q, order: i + 1 }));
      }
    });
    setTimeout(() => {
      const element = document.getElementById(`section-${newId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Supprime une section et toutes les questions qui lui appartiennent
  const deleteSectionAndQuestions = (sectionId) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === sectionId);
      if (idx === -1) return prev;
      // On garde tout avant la section, puis on saute jusqu'à la prochaine section (ou la fin)
      let endIdx = idx + 1;
      while (endIdx < prev.length && prev[endIdx].type !== "section") {
        endIdx++;
      }
      const newArr = [...prev.slice(0, idx), ...prev.slice(endIdx)];
      return newArr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  // Renommer une section
  const updateSectionLabel = (id, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label: value } : q)));
  };
  // Modifier la description d'une section
  const updateSectionDescription = (id, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, description: value } : q)));
  };
  // Supprimer une section
  const deleteSection = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Toggle collapse/expand section
  const toggleSectionCollapse = (id) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fonction pour lire et parser un fichier Excel
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier que c'est un fichier Excel
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
    ];

    if (!validTypes.includes(file.type)) {
      alert("Veuillez sélectionner un fichier Excel (.xlsx, .xls, .xlsm)");
      return;
    }

    setCascadeFileName(file.name);
    setCascadeFile(file);

    // Lire le fichier Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Prendre la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convertir les données Excel en format texte pour la cascade
        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const rows = jsonData.slice(1);

          // Créer le texte de cascade à partir des données Excel
          let cascadeTextFromExcel = headers.join("\t") + "\n";
          rows.forEach((row) => {
            cascadeTextFromExcel += row.join("\t") + "\n";
          });

          setCascadeText(cascadeTextFromExcel.trim());
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier Excel:", error);
        alert("Erreur lors de la lecture du fichier Excel. Vérifiez que le fichier est valide.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Fonction pour réinitialiser l'upload de fichier
  const handleClearFile = () => {
    setCascadeFile(null);
    setCascadeFileName("");
    setCascadeText("");
  };

  // Génération automatique de questions à partir du texte de cascade
  function handleGenerateCascade() {
    if (!cascadeText.trim() || !cascadeTargetQuestionId) {
      setCascadeModalOpen(false);
      setCascadeText("");
      return;
    }
    // 1. Parse le texte en lignes et colonnes (tabulation ou espaces multiples)
    const lines = cascadeText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setCascadeModalOpen(false);
      setCascadeText("");
      return;
    }
    // 2. En-têtes
    const headers = lines[0].split(/\t|\s{2,}/).map((h) => h.trim());
    console.log(`[DEBUG cascade] Headers:`, headers);
    const data = lines.slice(1).map((line) => {
      const cols = line.split(/\t|\s{2,}/).map((c) => c.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] || "";
      });
      return obj;
    });
    console.log(`[DEBUG cascade] Parsed data:`, data);
    // 3. Variables à créer (niveaux) = valeurs uniques de list_name
    const levels = Array.from(new Set(data.map((row) => row.list_name).filter(Boolean)));
    console.log(`[DEBUG cascade] Levels found:`, levels);
    // 4. Pour chaque niveau, génère la question et ses options
    const questionsToAdd = [];
    const levelToQuestionId = {};
    let orderBase = 0;
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === cascadeTargetQuestionId);
      orderBase = prev[idx]?.order || idx + 1;
      let insertIdx = idx + 1;
      levels.forEach((level, levelIdx) => {
        // Générer les options pour ce niveau
        const filteredData = data.filter((row) => row.list_name === level);
        console.log(`[DEBUG] Données pour le niveau ${level}:`, filteredData);

        const options = filteredData.map((row) => {
          const option = row.label || row.name;
          console.log(
            `[DEBUG] Option pour ${row.name}: label="${row.label}", name="${row.name}", final="${option}"`
          );
          return option;
        }); // Utiliser row.label pour l'affichage, fallback sur name
        // Génère un id unique pour la question
        const qId = `cascade_${level.toLowerCase()}_${Date.now()}_${Math.floor(
          Math.random() * 100000
        )}`;
        levelToQuestionId[level] = qId;
        // Dépendance
        let cascadeParent = null;
        if (levelIdx > 0) {
          cascadeParent = levelToQuestionId[levels[levelIdx - 1]];
        }

        // Créer la question avec la structure complète pour l'API
        const question = {
          id: qId,
          label: level,
          type: "choix_unique",
          required: false,
          options: options,
          active: false,
          order: orderBase + levelIdx + 1,
        };

        // Ajouter la relation parent-enfant pour les cascades
        if (cascadeParent) {
          question.cascadeParent = cascadeParent;
        }

        // Définir parent_parameter_libelle selon le niveau (générique)
        if (levelIdx > 0) {
          // Le parent est le niveau précédent dans la liste
          const parentLevel = levels[levelIdx - 1];
          question.parent_parameter_libelle = parentLevel;
        }

        // Ajouter les modalités avec control_parameters et control_action si nécessaire
        if (options.length > 0) {
          question.modalities = options.map((opt, optIdx) => {
            const modality = {
              order: optIdx + 1, // L'ordre de la modalité
              libelle: opt, // Utiliser directement opt (qui est maintenant le label)
              control_parameters: [],
              control_action: "show",
            };

            // Si c'est une question enfant dans la cascade, ajouter parent_modality_libelle
            if (cascadeParent && levelIdx > 0) {
              // Chercher dans les données la ligne correspondante
              // opt contient maintenant la valeur de la colonne label, donc chercher avec row.label
              const correspondingRow = data.find(
                (row) =>
                  normalize(row.list_name) === normalize(level) &&
                  normalize(row.label) === normalize(opt)
              );

              // Debug: afficher ce qu'on cherche et ce qu'on trouve
              if (!correspondingRow) {
                console.warn(`[CASCADE DEBUG] Ligne non trouvée pour ${level} / ${opt}`, {
                  searched: { list_name: level, label: opt },
                  normalized: { list_name: normalize(level), label: normalize(opt) },
                  availableData: data
                    .filter((row) => normalize(row.list_name) === normalize(level))
                    .map((row) => ({
                      list_name: row.list_name,
                      name: row.name,
                      label: row.label,
                      normalized_label: normalize(row.label),
                    })),
                });
              }

              let parentValue = null;
              if (levelIdx > 0) {
                // Niveau parent direct
                const parentLevel = levels[levelIdx - 1];
                if (correspondingRow && correspondingRow[parentLevel]) {
                  // Cherche le label correspondant dans data
                  const parentRow = data.find(
                    (row) =>
                      normalize(row.list_name) === normalize(parentLevel) &&
                      normalize(row.name) === normalize(correspondingRow[parentLevel])
                  );
                  if (parentRow && parentRow.label) {
                    parentValue = parentRow.label;
                  } else {
                    parentValue = correspondingRow[parentLevel];
                  }
                } else {
                  // Fallback : chercher dans les colonnes de niveau supérieur
                  for (let i = levelIdx - 1; i >= 0; i--) {
                    const candidateParentLevel = levels[i];
                    if (correspondingRow && correspondingRow[candidateParentLevel]) {
                      // Cherche le label correspondant dans data
                      const parentRow = data.find(
                        (row) =>
                          normalize(row.list_name) === normalize(candidateParentLevel) &&
                          normalize(row.name) === normalize(correspondingRow[candidateParentLevel])
                      );
                      if (parentRow && parentRow.label) {
                        parentValue = parentRow.label;
                      } else {
                        // Si on fallback sur une colonne qui n'est pas le parent direct, on assigne la valeur au parent direct
                        if (candidateParentLevel !== levels[levelIdx - 1]) {
                          // Assigner la valeur trouvée au parent direct et vider les autres colonnes
                          const directParentLevel = levels[levelIdx - 1];
                          correspondingRow[directParentLevel] =
                            correspondingRow[candidateParentLevel];

                          // Vider les autres colonnes de niveau supérieur
                          for (let i = 0; i < levelIdx - 1; i++) {
                            const otherLevel = levels[i];
                            if (otherLevel !== directParentLevel) {
                              correspondingRow[otherLevel] = "";
                            }
                          }

                          // Maintenant chercher le label dans le parent direct
                          const directParentRow = data.find(
                            (row) =>
                              normalize(row.list_name) === normalize(directParentLevel) &&
                              normalize(row.name) === normalize(correspondingRow[directParentLevel])
                          );

                          if (directParentRow && directParentRow.label) {
                            parentValue = directParentRow.label;
                            console.log(
                              `[CASCADE FALLBACK] ${level} ${opt}: Valeur "${correspondingRow[candidateParentLevel]}" trouvée dans ${candidateParentLevel}, assignée à ${directParentLevel}, label trouvé: "${directParentRow.label}"`
                            );
                          } else {
                            parentValue = correspondingRow[directParentLevel];
                            console.log(
                              `[CASCADE FALLBACK] ${level} ${opt}: Valeur "${correspondingRow[candidateParentLevel]}" trouvée dans ${candidateParentLevel}, assignée à ${directParentLevel}, label non trouvé, utilisation valeur brute`
                            );
                          }
                        } else {
                          parentValue = correspondingRow[candidateParentLevel];
                        }
                      }
                      break;
                    }
                  }
                  if (!parentValue) {
                    parentValue = "???";
                    console.warn(
                      `[CASCADE WARNING] parent_modality_libelle introuvable pour ${level} / ${opt} (parent: ${
                        levels[levelIdx - 1]
                      })`,
                      {
                        correspondingRow,
                        parentLevel: levels[levelIdx - 1],
                        opt,
                        level,
                        dataRow: correspondingRow,
                      }
                    );
                  }
                }
                modality.parent_modality_libelle = parentValue;
                if (parentValue === "???") {
                  console.warn(
                    `[CASCADE WARNING] parent_modality_libelle introuvable pour ${level} / ${opt} (parents testés: ${levels
                      .slice(0, levelIdx)
                      .join(" > ")})`,
                    { correspondingRow, opt, level, dataRow: correspondingRow }
                  );
                }
                console.log(
                  `[DEBUG cascade] ${level} ${opt}: Set parent_modality_libelle to: ${parentValue} (parents testés: ${levels
                    .slice(0, levelIdx)
                    .join(" > ")})`,
                  { correspondingRow, opt, level, dataRow: correspondingRow }
                );
              }
            }

            return modality;
          });
        }

        console.log(`[DEBUG cascade] Final question structure:`, JSON.stringify(question, null, 2));
        questionsToAdd.push(question);
      });
      // Insère les questions générées juste après la question cible
      const newArr = [...prev.slice(0, insertIdx), ...questionsToAdd, ...prev.slice(insertIdx)];
      // Recalcule l'ordre
      return newArr.map((q, i) => ({ ...q, order: i + 1 }));
    });
    setCascadeModalOpen(false);
    setCascadeText("");
    setCascadeTargetQuestionId(null);
  }

  // Fonction utilitaire pour normaliser les chaînes (minuscule, sans accents, trim)
  function normalize(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      {/* Indicateur de chargement */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 6,
            background: "linear-gradient(135deg, #77af0a 0%, #52734d 100%)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(119, 175, 10, 0.2)",
            mb: 3,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ color: "#fff", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: "600" }}>
              Chargement du formulaire...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Titre et description du formulaire */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          p: 4,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          width: "95%",
          mx: "auto",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #77af0a 0%, #52734d 100%)",
          },
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 24,
              fontWeight: "700",
              background: "#f8fafc",
              minHeight: 60,
              padding: "16px 20px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
            },
          }}
          sx={{
            "& .MuiInputBase-root:hover": {
              borderColor: "#cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            },
            "& .MuiInputBase-root:focus-within": {
              borderColor: "#77af0a",
              boxShadow: "0 4px 12px rgba(119, 175, 10, 0.15)",
            },
          }}
          placeholder="Titre du formulaire"
        />
        <TextField
          fullWidth
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 16,
              background: "#f8fafc",
              minHeight: 60,
              padding: "16px 20px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              transition: "all 0.3s ease",
            },
          }}
          sx={{
            mt: 2,
            "& .MuiInputBase-root:hover": {
              borderColor: "#cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            },
            "& .MuiInputBase-root:focus-within": {
              borderColor: "#77af0a",
              boxShadow: "0 4px 12px rgba(119, 175, 10, 0.15)",
            },
          }}
          placeholder="Description du formulaire"
        />
      </Box>

      {/* Barre d'outils pour les actions de copier-coller */}
      {selectedQuestions.size > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1000,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            p: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            border: "1px solid #e2e8f0",
            backdropFilter: "blur(10px)",
          }}
        >
          <Chip
            label={`${selectedQuestions.size} sélectionné(s)`}
            size="small"
            sx={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              fontWeight: "600",
            }}
          />
          <Button
            size="small"
            onClick={copySelectedQuestions}
            sx={{
              background: "linear-gradient(135deg, #77af0a 0%, #52734d 100%)",
              color: "white",
              borderRadius: 2,
              px: 2,
              py: 0.5,
              fontWeight: "600",
              "&:hover": {
                background: "linear-gradient(135deg, #6a991f 0%, #4a643c 100%)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Copier (Ctrl+C)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={clearSelection}
            sx={{
              borderColor: "#cbd5e1",
              color: "#64748b",
              borderRadius: 2,
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            Annuler
          </Button>
        </Box>
      )}

      {!isLoading &&
        (() => {
          // Regrouper les questions par section
          const elements = [];
          let currentSectionId = null;
          questions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach((q, idx, arr) => {
              if (q.type === "section") {
                currentSectionId = q.id;
                const isCollapsed = collapsedSections.has(q.id);
                elements.push(
                  <Box
                    id={`section-${q.id}`}
                    key={q.id}
                    sx={{
                      position: "relative",
                      p: 4,
                      mb: 3,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                      boxShadow: "0 8px 32px rgba(119, 175, 10, 0.1)",
                      width: "95%",
                      mx: "auto",
                      border: "1px solid #bbf7d0",
                      minHeight: 80,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 12px 40px rgba(119, 175, 10, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => setEditingSectionId(q.id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionCollapse(q.id);
                        }}
                        sx={{
                          mr: 2,
                          backgroundColor: "#ffffff",
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: "#f0f9ff",
                          },
                        }}
                      >
                        {isCollapsed ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                      </IconButton>
                      {/* Titre section + actions */}
                      {editingSectionId === q.id ? (
                        <TextField
                          variant="standard"
                          value={q.label}
                          onChange={(e) => updateSectionLabel(q.id, e.target.value)}
                          onBlur={() => setEditingSectionId(null)}
                          autoFocus
                          InputProps={{
                            disableUnderline: true,
                            style: {
                              fontWeight: "700",
                              fontSize: 22,
                              background: "#ffffff",
                              minHeight: 50,
                              padding: "12px 16px",
                              borderRadius: 8,
                              border: "2px solid #0ea5e9",
                            },
                          }}
                          sx={{ flex: 1, mr: 2 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <Typography
                          fontWeight="700"
                          fontSize={22}
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            color: "#0c4a6e",
                            "&:hover": {
                              color: "#0369a1",
                            },
                          }}
                        >
                          {q.label}
                        </Typography>
                      )}
                      {/* Actions section : + (dans), + (hors), section, edit, delete */}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Ajouter une question dans la section">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              addQuestionInSection(q.id);
                            }}
                            sx={{
                              color: "#0ea5e9",
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              "&:hover": {
                                backgroundColor: "#f0f9ff",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajouter une question en dehors de la section">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              addQuestionAfterSection(q.id);
                            }}
                            sx={{
                              color: "#64748b",
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              "&:hover": {
                                backgroundColor: "#f8fafc",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajouter une section en dessous">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              addSectionAfter(q.id);
                            }}
                            sx={{
                              color: "#0ea5e9",
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              "&:hover": {
                                backgroundColor: "#f0f9ff",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <ViewListIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier la section">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSectionId(q.id);
                            }}
                            sx={{
                              color: "#64748b",
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              "&:hover": {
                                backgroundColor: "#f8fafc",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <TextFieldsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer la section">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSectionAndQuestions(q.id);
                            }}
                            sx={{
                              color: "#ef4444",
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              "&:hover": {
                                backgroundColor: "#fef2f2",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {!isCollapsed && (
                      <TextField
                        variant="standard"
                        value={q.description || ""}
                        onChange={(e) => updateSectionDescription(q.id, e.target.value)}
                        placeholder="Description de la section (optionnel)"
                        InputProps={{
                          disableUnderline: true,
                          style: {
                            fontSize: 16,
                            background: "#ffffff",
                            minHeight: 40,
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            marginTop: 12,
                          },
                        }}
                        sx={{
                          mt: 2,
                          width: "100%",
                          "& .MuiInputBase-root:hover": {
                            borderColor: "#cbd5e1",
                          },
                          "& .MuiInputBase-root:focus-within": {
                            borderColor: "#667eea",
                          },
                        }}
                        multiline
                        maxRows={3}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </Box>
                );
              } else {
                // Si la question appartient à une section rabattue, on ne l'affiche pas
                if (currentSectionId && collapsedSections.has(currentSectionId)) {
                  return;
                }
                // Indente si dans une section
                const isInSection = !!currentSectionId;
                elements.push(
                  <Box
                    id={`question-${q.id}`}
                    key={q.id}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        e.stopPropagation();
                        toggleQuestionSelection(q.id);
                      } else {
                        setActiveQuestion(q.id);
                      }
                    }}
                    sx={{
                      position: "relative",
                      p: q.active ? 4 : 3,
                      mb: 3,
                      borderRadius: 3,
                      backgroundColor: selectedQuestions.has(q.id)
                        ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: selectedQuestions.has(q.id)
                        ? "0 12px 40px rgba(119, 175, 10, 0.15)"
                        : "0 8px 32px rgba(0,0,0,0.08)",
                      width: "95%",
                      mx: "auto",
                      cursor: "pointer",
                      minHeight: q.active ? 140 : "auto",
                      transition: "all 0.3s ease",
                      border: selectedQuestions.has(q.id)
                        ? "2px solid #77af0a"
                        : "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: selectedQuestions.has(q.id)
                          ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                          : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      },
                      ...(isInSection
                        ? {
                            ml: 4,
                            mr: 4,
                            width: "88%",
                            mx: "auto",
                            backgroundColor: selectedQuestions.has(q.id)
                              ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                          }
                        : {}),
                    }}
                  >
                    {q.active && (
                      <>
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 6,
                            background: "linear-gradient(180deg, #77af0a 0%, #52734d 100%)",
                            borderTopRightRadius: 4,
                            borderBottomRightRadius: 4,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            right: -60,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: 180,
                            width: 50,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            borderRadius: 3,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                            p: 1,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Tooltip title="Ajouter une question" placement="left">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                addNewQuestion(q.id);
                              }}
                              sx={{
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#e2e8f0",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Créer une cascade" placement="left">
                            <IconButton
                              sx={{
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#e2e8f0",
                                  transform: "scale(1.1)",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCascadeTargetQuestionId(q.id);
                                setCascadeModalOpen(true);
                              }}
                            >
                              <TimelineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ajouter une section" placement="left">
                            <IconButton
                              sx={{
                                color: "#77af0a",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#f0fdf4",
                                  transform: "scale(1.1)",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addSectionAfter(q.id);
                              }}
                            >
                              <ViewListIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ajouter une note" placement="left">
                            <IconButton
                              sx={{
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#e2e8f0",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <NoteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </>
                    )}

                    {q.active ? (
                      <>
                        <TextField
                          variant="standard"
                          fullWidth
                          placeholder="Intitulé de la question"
                          value={q.label}
                          onChange={(e) => updateLabel(q.id, e.target.value)}
                          InputProps={{
                            disableUnderline: true,
                            style: {
                              fontWeight: "700",
                              fontSize: 20,
                              background: "#f8fafc",
                              minHeight: 60,
                              padding: "16px 20px",
                              borderRadius: 12,
                              border: "2px solid #e2e8f0",
                              transition: "all 0.3s ease",
                            },
                          }}
                          sx={{
                            mb: 2,
                            "& .MuiInputBase-root:hover": {
                              borderColor: "#cbd5e1",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            },
                            "& .MuiInputBase-root:focus-within": {
                              borderColor: "#77af0a",
                              boxShadow: "0 4px 12px rgba(119, 175, 10, 0.15)",
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: "17px",
                              height: 52,
                              borderRadius: 3,
                              border: "2px solid #e2e8f0",
                              backgroundColor: "#ffffff",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              px: 3,
                              "&:hover": {
                                borderColor: "#77af0a",
                                backgroundColor: "#f0fdf4",
                                boxShadow: "0 8px 24px rgba(119, 175, 10, 0.15)",
                                transform: "translateY(-1px)",
                              },
                              "&:active": {
                                transform: "translateY(0px)",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openTypeModal(q.id);
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                              {typeIcons[q.type]}
                              <span style={{ fontWeight: "600", color: "#1e293b" }}>
                                {questionTypes.find((type) => type.value === q.type)?.label}
                              </span>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="center" gap={2}>
                            <Switch
                              checked={q.required}
                              onChange={() => toggleRequired(q.id)}
                              size="medium"
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#667eea",
                                  "&:hover": {
                                    backgroundColor: "rgba(102, 126, 234, 0.08)",
                                  },
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                  backgroundColor: "#667eea",
                                },
                              }}
                            />
                            <Typography fontSize={16} color="#64748b" fontWeight="500">
                              Réponse obligatoire
                            </Typography>
                          </Box>
                        </Box>

                        {(q.type === "choix_unique" ||
                          q.type === "choix_multiple" ||
                          q.type === "liste_deroulante" ||
                          q.type === "binaire") && (
                          <Box sx={{ ml: 2, mt: 3 }}>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                              {(q.type === "binaire"
                                ? q.options.length === 2
                                  ? q.options
                                  : ["Oui", "Non"]
                                : q.options
                              ).map((opt, idx) => (
                                <TextField
                                  key={idx}
                                  variant="standard"
                                  value={opt}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={
                                    q.type === "binaire"
                                      ? (e) => {
                                          const newOptions = [
                                            ...(q.options.length === 2
                                              ? q.options
                                              : ["Oui", "Non"]),
                                          ];
                                          newOptions[idx] = e.target.value;
                                          setQuestions((prev) =>
                                            prev.map((qq) =>
                                              qq.id === q.id ? { ...qq, options: newOptions } : qq
                                            )
                                          );
                                        }
                                      : (e) => updateOptionText(q.id, idx, e.target.value)
                                  }
                                  InputProps={{
                                    disableUnderline: true,
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        {q.type === "choix_unique" || q.type === "binaire" ? (
                                          <RadioButtonCheckedIcon
                                            fontSize="small"
                                            sx={{ color: "#77af0a" }}
                                          />
                                        ) : q.type === "choix_multiple" ? (
                                          <CheckBoxIcon
                                            fontSize="small"
                                            sx={{ color: "#77af0a" }}
                                          />
                                        ) : (
                                          "•"
                                        )}
                                      </InputAdornment>
                                    ),
                                    endAdornment:
                                      q.type !== "binaire" ? (
                                        <IconButton
                                          size="small"
                                          onClick={() => deleteOption(q.id, idx)}
                                          sx={{
                                            color: "#ef4444",
                                            "&:hover": {
                                              backgroundColor: "#fef2f2",
                                            },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      ) : null,
                                    style: {
                                      background: "#f8fafc",
                                      minHeight: 50,
                                      padding: "12px 16px",
                                      borderRadius: 12,
                                      border: "2px solid #e2e8f0",
                                      transition: "all 0.3s ease",
                                    },
                                  }}
                                  sx={{
                                    mb: 2,
                                    width: "calc(50% - 8px)",
                                    minWidth: "220px",
                                    "& .MuiInputBase-root:hover": {
                                      borderColor: "#cbd5e1",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                    },
                                    "& .MuiInputBase-root:focus-within": {
                                      borderColor: "#667eea",
                                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                                    },
                                  }}
                                  disabled={false}
                                />
                              ))}
                            </Box>
                            {q.type !== "binaire" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mt: 2,
                                  fontSize: 16,
                                }}
                              >
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addOption(q.id);
                                  }}
                                  sx={{
                                    cursor: "pointer",
                                    color: "#77af0a",
                                    fontWeight: "600",
                                    padding: "8px 16px",
                                    borderRadius: 2,
                                    backgroundColor: "#f0fdf4",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      backgroundColor: "#dcfce7",
                                      transform: "translateY(-1px)",
                                    },
                                  }}
                                >
                                  Ajouter une option
                                </Box>
                                <Box sx={{ color: "#64748b" }}>ou</Box>
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addOption(q.id, true);
                                  }}
                                  sx={{
                                    cursor: "pointer",
                                    color: "#64748b",
                                    fontWeight: "600",
                                    padding: "8px 16px",
                                    borderRadius: 2,
                                    backgroundColor: "#f8fafc",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      backgroundColor: "#f1f5f9",
                                      transform: "translateY(-1px)",
                                    },
                                  }}
                                >
                                  Ajouter Autre
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}

                        <Box display="flex" gap={1} mt={2}>
                          <Tooltip title="Copier la question">
                            <IconButton
                              onClick={() => copyQuestion(q.id)}
                              sx={{
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#e2e8f0",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 24 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer la question">
                            <IconButton
                              onClick={() => deleteQuestion(q.id)}
                              sx={{
                                color: "#ef4444",
                                backgroundColor: "#fef2f2",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#fee2e2",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 24 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Plus d'options">
                            <IconButton
                              onClick={() => alert("Options supplémentaires à venir")}
                              sx={{
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "#e2e8f0",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 24 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography fontWeight="700" fontSize={18} color="#1e293b">
                          {q.label || "Sans intitulé"}
                          {q.required && (
                            <Chip
                              label="Obligatoire"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: "#fef2f2",
                                color: "#dc2626",
                                fontSize: "10px",
                                height: "20px",
                              }}
                            />
                          )}
                        </Typography>
                        <Typography
                          fontSize={14}
                          color="#64748b"
                          sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            fontWeight: "500",
                          }}
                        >
                          {typeIcons[q.type]}
                          {questionTypes.find((type) => type.value === q.type)?.label}
                        </Typography>
                      </>
                    )}
                  </Box>
                );
              }
            });
          return elements;
        })()}

      {/* Modal de sélection de type de question */}
      <Modal
        open={typeModalOpen}
        onClose={closeTypeModal}
        aria-labelledby="type-selection-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 1 }}>
              Choisir le type de question
            </Typography>
            <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
              Sélectionnez le type de question qui correspond le mieux à vos besoins
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {questionTypes.map((type) => (
              <Grid item xs={12} sm={6} md={3} key={type.value}>
                <Paper
                  onClick={() => updateType(selectedQuestionId, type.value)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                      borderColor: "#77af0a",
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    minHeight: 120,
                  }}
                >
                  <Box
                    sx={{
                      color: "#77af0a",
                      mb: 1,
                      "& .MuiSvgIcon-root": {
                        fontSize: "2.5rem",
                      },
                    }}
                  >
                    {type.icon}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "600",
                      color: "#2c3e50",
                      fontSize: "0.8rem",
                    }}
                  >
                    {type.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              onClick={closeTypeModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderColor: "#77af0a",
                color: "#77af0a",
                "&:hover": {
                  borderColor: "#5a8a08",
                  backgroundColor: "rgba(119, 175, 10, 0.04)",
                },
              }}
            >
              Annuler
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Modal cascade */}
      <Modal
        open={cascadeModalOpen}
        onClose={() => setCascadeModalOpen(false)}
        aria-labelledby="cascade-modal"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#2c3e50", mb: 1, textAlign: "left" }}
            >
              Créer une cascade de questions
            </Typography>
            <Typography variant="body2" sx={{ color: "#7f8c8d", textAlign: "left", mb: 2 }}>
              Choisissez votre méthode d&apos;entrée pour créer la cascade :
            </Typography>

            {/* Sélecteur de mode d'entrée */}
            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Button
                    variant={cascadeInputMode === "text" ? "contained" : "outlined"}
                    onClick={() => setCascadeInputMode("text")}
                    startIcon={<DescriptionIcon />}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      background: cascadeInputMode === "text" ? "#77af0a" : "transparent",
                      color: cascadeInputMode === "text" ? "#fff" : "#77af0a",
                      borderColor: "#77af0a",
                      "&:hover": {
                        background:
                          cascadeInputMode === "text" ? "#5a8a08" : "rgba(119, 175, 10, 0.04)",
                      },
                    }}
                  >
                    Saisie manuelle
                  </Button>
                  <Button
                    variant={cascadeInputMode === "file" ? "contained" : "outlined"}
                    onClick={() => setCascadeInputMode("file")}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      background: cascadeInputMode === "file" ? "#77af0a" : "transparent",
                      color: cascadeInputMode === "file" ? "#fff" : "#77af0a",
                      borderColor: "#77af0a",
                      "&:hover": {
                        background:
                          cascadeInputMode === "file" ? "#5a8a08" : "rgba(119, 175, 10, 0.04)",
                      },
                    }}
                  >
                    Fichier Excel
                  </Button>
                </Box>
              </FormControl>
            </Box>

            {/* Mode saisie manuelle */}
            {cascadeInputMode === "text" && (
              <>
                <Typography variant="body2" sx={{ color: "#7f8c8d", textAlign: "left", mb: 2 }}>
                  Collez ou écrivez ci-dessous la définition de votre cascade. Chaque ligne doit
                  décrire une condition ou une option. Exemple :<br />
                  <span style={{ fontStyle: "italic", color: "#555" }}>
                    Si A alors Option 1<br />
                    Si B alors Option 2<br />
                    Sinon Option 3
                  </span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  maxRows={16}
                  value={cascadeText}
                  onChange={(e) => setCascadeText(e.target.value)}
                  placeholder="Définition de la cascade..."
                  sx={{ mb: 3, background: "#fff", borderRadius: 2 }}
                />
              </>
            )}

            {/* Mode fichier Excel */}
            {cascadeInputMode === "file" && (
              <>
                <Typography variant="body2" sx={{ color: "#7f8c8d", textAlign: "left", mb: 2 }}>
                  Uploadez un fichier Excel (.xlsx, .xls) contenant vos données de cascade. Le
                  fichier doit avoir des en-têtes et des données tabulées.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {!cascadeFile ? (
                    <Box
                      sx={{
                        border: "2px dashed #77af0a",
                        borderRadius: 2,
                        p: 4,
                        textAlign: "center",
                        background: "rgba(119, 175, 10, 0.05)",
                        cursor: "pointer",
                        "&:hover": {
                          background: "rgba(119, 175, 10, 0.1)",
                        },
                      }}
                      onClick={() => document.getElementById("excel-file-input").click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: "#77af0a", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "#77af0a", mb: 1 }}>
                        Cliquez pour sélectionner un fichier Excel
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                        Formats acceptés : .xlsx, .xls, .xlsm
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: "2px solid #77af0a",
                        borderRadius: 2,
                        p: 3,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <InsertDriveFileIcon sx={{ color: "#77af0a" }} />
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {cascadeFileName}
                        </Typography>
                      </Box>
                      <Button
                        onClick={handleClearFile}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          "&:hover": {
                            borderColor: "#b71c1c",
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                          },
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  )}

                  <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </Box>

                {/* Aperçu des données parsées */}
                {cascadeText && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                      Aperçu des données parsées :
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={cascadeText}
                      InputProps={{ readOnly: true }}
                      sx={{ background: "#f5f5f5", borderRadius: 2 }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={() => {
                setCascadeModalOpen(false);
                setCascadeText("");
                setCascadeFile(null);
                setCascadeFileName("");
              }}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 4,
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": {
                  borderColor: "#b71c1c",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenerateCascade}
              variant="contained"
              disabled={!cascadeText.trim()}
              sx={{ borderRadius: 2, px: 4, background: "#77af0a", color: "#fff" }}
            >
              Générer la cascade
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

QuestionPage.propTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  parentLoading: PropTypes.bool,
};

export default QuestionPage;
