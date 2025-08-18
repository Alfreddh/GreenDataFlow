import axios from "axios";

const API_BASE_URL = "https://api-gti-collect.green-tech-innovation.com";

// Créer l'instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ne pas gérer les erreurs 401 pour les routes d'authentification
    const isAuthRoute = error.config.url.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn(
        "[DEBUG] 401 reçu dans l'intercepteur response, suppression du token maintenant."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Déclencher un événement personnalisé pour informer l'application
      window.dispatchEvent(
        new CustomEvent("auth-error", {
          detail: { message: "Session expirée" },
        })
      );
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      // En cas d'erreur lors de la déconnexion, on nettoie quand même le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get("/auth/verify");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPasswordCode: async (data) => {
    try {
      const response = await api.post("/auth/reset-password-code", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPasswordVerification: async (data) => {
    try {
      const response = await api.post("/auth/reset-password-verification", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post("/auth/reset-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyAccount: async (data) => {
    try {
      const response = await api.post("/auth/verify-account", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Convertir le format de nos questions vers le format de l'API
const convertQuestionsToParameters = (questions) => {
  return questions
    .map((q, index) => {
      if (!q || typeof q !== "object") {
        console.error("Question invalide:", q);
        return null;
      }

      // Ignorer les sections (elles ne sont pas des paramètres)
      if (q.type === "section") {
        return null;
      }

      // Construction de l'objet paramètre selon la structure de l'API
      const parameter = {
        libelle: q.label || q.libelle || "",
        order: q.order || index + 1,
        type: q.type || "text",
        is_required: Boolean(q.required),
        max_length: q.max_length ?? null,
        a_value: q.a_value ?? null,
        b_value: q.b_value ?? null,
        modalities: [],
      };

      // Ajouter content_condition si défini
      if (
        q.content_condition !== undefined &&
        q.content_condition !== null &&
        q.content_condition !== ""
      ) {
        parameter.content_condition = q.content_condition;
      }

      // Ajouter les informations de section si la question appartient à une section
      if (q.section_no !== undefined && q.section_no !== null) {
        parameter.section_no = q.section_no;
      }
      if (q.section !== undefined && q.section !== null && q.section !== "") {
        parameter.section = q.section;
      }

      // Ajouter parent_parameter_libelle pour les cascades
      if (q.parent_parameter_libelle) {
        parameter.parent_parameter_libelle = q.parent_parameter_libelle;
      } else if (q.cascadeParent !== undefined && q.cascadeParent !== null) {
        // Trouver le libellé du parent
        const parentQuestion = questions.find((pq) => pq.id === q.cascadeParent);
        if (parentQuestion) {
          parameter.parent_parameter_libelle = parentQuestion.label || parentQuestion.libelle;
        }
      }

      // Génération des modalités pour tous les types à choix
      if (
        [
          "choix_unique",
          "choix_multiple",
          "select",
          "multiselect",
          "radio",
          "checkbox",
          "binaire",
        ].includes(parameter.type)
      ) {
        let baseModalities;
        if (Array.isArray(q.modalities) && q.modalities.length > 0) {
          baseModalities = q.modalities;
        } else {
          if (parameter.type === "binaire") {
            const opts =
              Array.isArray(q.options) && q.options.length === 2 ? q.options : ["Oui", "Non"];
            baseModalities = opts.map((opt, i) => ({
              order: i + 1,
              libelle: opt,
              control_parameters: [],
            }));
          } else {
            baseModalities = (q.options || []).map((opt, i) => ({
              order: i + 1,
              libelle: opt,
              control_parameters: [],
            }));
          }
        }
        // Trie les modalités par order croissant
        baseModalities = [...baseModalities].sort((a, b) => {
          if (typeof a.order === "number" && typeof b.order === "number") {
            return a.order - b.order;
          }
          return 0;
        });
        parameter.modalities = baseModalities.map((m, i) => {
          const modality = {
            order: m.order || i + 1,
            libelle: m.libelle,
            control_parameters: Array.isArray(m.control_parameters) ? m.control_parameters : [],
          };
          if (
            Array.isArray(m.control_parameters) &&
            m.control_parameters.length > 0 &&
            m.control_action
          ) {
            modality.control_action = m.control_action;
          }
          if (m.parent_modality_libelle) {
            modality.parent_modality_libelle = m.parent_modality_libelle;
          }
          return modality;
        });
      } else {
        // Pour tous les autres types, modalities est toujours un tableau vide
        parameter.modalities = [];
      }

      console.log(
        `[DEBUG convert] Final parameter for ${q.label || q.libelle}:`,
        JSON.stringify(parameter, null, 2)
      );
      console.log(`[DEBUG convert] Paramètres de validation pour ${q.label || q.libelle}:`, {
        content_condition: q.content_condition,
        a_value: q.a_value,
        b_value: q.b_value,
        max_length: q.max_length,
      });
      return parameter;
    })
    .filter(Boolean); // Filtrer les éventuels paramètres null
};

// Service de gestion des formulaires
export const formService = {
  // Récupérer tous les formulaires
  getAllForms: async (url = null) => {
    try {
      const response = url ? await api.get(url) : await api.get("/collecte/forms/all");
      return response.data; // Retourne tout l'objet (data, total_pages, next, previous...)
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un formulaire par son ID
  getFormById: async (formId) => {
    try {
      const response = await api.get(`/collecte/forms/${formId}`);

      // Si la réponse est dans response.data.data, on la retourne directement
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      // Sinon on retourne la réponse telle quelle
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée dans getFormById:", error.response || error);
      throw error;
    }
  },

  // Créer un nouveau formulaire
  createForm: async (formData) => {
    try {
      // Vérifier le token avant l'envoi
      const token = localStorage.getItem("token");

      if (!formData || !Array.isArray(formData.parameters)) {
        console.error("Format de données invalide:", formData);
        throw new Error("Format de données invalide");
      }

      const apiFormData = {
        title: formData.title || "",
        description: formData.description || "",
        cover_image: formData.cover_image || "",
        parameters: convertQuestionsToParameters(formData.parameters),
      };

      // Afficher la requête complète (url, headers, data)
      const url = "/collecte/forms/create";
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${token}`,
      };

      const response = await api.post(url, apiFormData);
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Erreur dans createForm:", error.response || error);
      throw error;
    }
  },

  // Mettre à jour un formulaire
  updateForm: async (formId, formData) => {
    try {
      // Vérifier le token avant l'envoi
      const token = localStorage.getItem("token");

      if (!formData || !Array.isArray(formData.parameters)) {
        console.error("Format de données invalide:", formData);
        throw new Error("Format de données invalide");
      }

      const apiFormData = {
        title: formData.title,
        description: formData.description || "",
        cover_image: formData.cover_image || "",
        parameters: convertQuestionsToParameters(formData.parameters),
      };

      // Afficher la requête complète (url, headers, data)
      const id = formId;
      const url = `/collecte/forms/${id}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${token}`,
      };

      // Utiliser PATCH au lieu de POST
      const response = await api.patch(url, apiFormData);
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Erreur dans updateForm:", error.response || error); // Debug
      throw error;
    }
  },

  // Supprimer un formulaire
  deleteForm: async (formId) => {
    try {
      const response = await api.post(`/collecte/forms/${formId}/delete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Soumettre une réponse à un formulaire
  submitFormResponse: async (formId, responseData) => {
    try {
      const response = await api.post(`/data/forms/responses/${formId}/add`, responseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les réponses d'un formulaire
  getFormResponses: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/responses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les réponses d'un formulaire (nouvelle version)
  getFormResponsesV2: async (formId) => {
    try {
      const response = await api.get(`/data/forms/responses/${formId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Télécharger la base d'un formulaire
  downloadFormBase: async (identifier) => {
    try {
      const response = await api.post("/collecte/forms/download/base", { identifier });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le statut d'un formulaire (archiver, publier, désarchiver)
  updateFormStatus: async (formId, status) => {
    // status: { is_archive?: boolean, is_public?: boolean }
    try {
      const response = await api.post(`/collecte/forms/${formId}/update`, status);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assigner une permission à un utilisateur sur un formulaire
  assignFormPermission: async ({ form, email, permission, group, agent }) => {
    try {
      const payload = { form, email, permission };
      if (group !== undefined && group !== null) payload.group = group;
      if (agent !== undefined && agent !== null) payload.agent = agent;
      const response = await api.post("/base/forms/permissions/assign", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Télécharger les réponses d'un formulaire
  downloadFormResponses: async (formId) => {
    try {
      const response = await api.get(`/data/forms/responses/${formId}/download`, {
        responseType: "blob", // Pour gérer le téléchargement de fichier
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les datas détaillées d'une réponse
  getFormResponseDatas: async (responseId) => {
    try {
      const response = await api.get(`/data/forms/responses/${responseId}/datas`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service de gestion des groupes
export const groupService = {
  // Récupérer tous les groupes
  getAllGroups: async () => {
    try {
      const response = await api.get("/collecte/groups/all");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer un groupe
  createGroup: async (name) => {
    try {
      const response = await api.post("/collecte/groups/create", { name });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Modifier un groupe
  updateGroup: async (id, name) => {
    try {
      const response = await api.post(`/collecte/groups/${id}/update`, { name });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un groupe
  deleteGroup: async (id) => {
    try {
      const response = await api.delete(`/collecte/groups/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un groupe par son id
  getGroupById: async (id) => {
    try {
      const response = await api.get(`/collecte/groups/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Ajouter un formulaire à un groupe
  addFormToGroup: async (groupId, formId) => {
    try {
      const response = await api.post(`/collecte/groups/${groupId}/add-form`, { form: formId });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Retirer un formulaire d'un groupe
  removeFormFromGroup: async (groupId, formId) => {
    try {
      const response = await api.post(`/collecte/groups/${groupId}/remove-form`, { form: formId });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les formulaires d'un groupe
  getGroupForms: async (groupId) => {
    try {
      const response = await api.get(`/collecte/groups/${groupId}/forms`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
