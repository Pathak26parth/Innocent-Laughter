const mediaUploadForm = document.getElementById("mediaUploadForm");
const mediaUploadStatus = document.getElementById("mediaUploadStatus");
const adminMediaGrid = document.getElementById("adminMediaGrid");
const refreshMediaListBtn = document.getElementById("refreshMediaListBtn");
const mediaFormMode = document.getElementById("mediaFormMode");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const submitMediaBtn = document.getElementById("submitMediaBtn");
const mediaFileInput = document.getElementById("mediaFile");

const GLIMPSE_API_ENDPOINT = "/api/glimpses";
let editingMediaId = null;
let adminMediaItems = [];

const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
};

const formatDate = (dateString) => {
    if (!dateString) {
        return "No date";
    }

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const getInput = (id) => document.getElementById(id);

const setValue = (id, value) => {
    const input = getInput(id);
    if (input) {
        input.value = value;
    }
};

const setChecked = (id, value) => {
    const input = getInput(id);
    if (input) {
        input.checked = Boolean(value);
    }
};

const setCreateMode = () => {
    editingMediaId = null;

    if (mediaUploadForm) {
        mediaUploadForm.reset();
    }

    if (mediaFileInput) {
        mediaFileInput.required = true;
    }

    if (mediaFormMode) {
        mediaFormMode.textContent = "Create a new glimpse or promo item.";
    }

    if (submitMediaBtn) {
        submitMediaBtn.textContent = "Upload to Database";
    }

    if (cancelEditBtn) {
        cancelEditBtn.hidden = true;
    }

    setValue("mediaCategory", "showcase");
    setChecked("mediaPublished", true);
};

const setEditMode = (item) => {
    editingMediaId = item._id;

    if (mediaUploadForm) {
        mediaUploadForm.reset();
    }

    setValue("mediaTitle", item.title || "");
    setValue("mediaType", item.type || "image");
    setValue("mediaCategory", item.category || "showcase");
    setValue("mediaDescription", item.description || "");
    setValue("mediaEventDate", item.eventDate ? String(item.eventDate).slice(0, 10) : "");
    setValue("mediaDisplayOrder", String(item.displayOrder ?? 0));
    setValue("mediaTags", Array.isArray(item.tags) ? item.tags.join(", ") : "");
    setChecked("mediaFeatured", item.isFeatured);
    setChecked("mediaPublished", item.isPublished);

    if (mediaFileInput) {
        mediaFileInput.required = false;
    }

    if (mediaFormMode) {
        mediaFormMode.textContent = `Editing ${item.title}. Select a new media file only if you want to replace the current one.`;
    }

    if (submitMediaBtn) {
        submitMediaBtn.textContent = "Update Media";
    }

    if (cancelEditBtn) {
        cancelEditBtn.hidden = false;
    }
};

const renderMediaCard = (item) => {
    const mediaUrl = item.mediaUrl || "";
    const thumbnailUrl = item.thumbnailUrl || "";
    const badges = [item.type, item.category, item.isPublished ? "published" : "hidden", item.isFeatured ? "featured" : null].filter(Boolean);

    const mediaMarkup = item.type === "video"
        ? `<video controls preload="metadata" ${thumbnailUrl ? `poster="${thumbnailUrl}"` : ""}><source src="${mediaUrl}" type="${escapeHtml(item.media?.contentType || "video/mp4")}">Your browser does not support the video tag.</video>`
        : `<img src="${mediaUrl}" alt="${escapeHtml(item.title)}">`;

    return `
        <article class="admin-media-card">
            ${mediaMarkup}
            <div class="admin-media-body">
                <div class="admin-badge-row">
                    ${badges.map((badge) => `<span class="admin-badge">${escapeHtml(badge)}</span>`).join("")}
                </div>
                <h3 style="margin: 0 0 0.35rem;">${escapeHtml(item.title)}</h3>
                <p style="margin: 0 0 0.45rem; color: var(--muted); font-size: 0.9rem;">${escapeHtml(item.description || "")}</p>
                <p style="margin: 0; font-size: 0.82rem; color: var(--muted);">${formatDate(item.createdAt)}</p>
                <div class="admin-card-actions">
                    <button class="btn btn-secondary admin-card-btn" type="button" data-action="edit" data-id="${item._id}">Edit</button>
                    <button class="btn btn-secondary admin-card-btn admin-card-btn-danger" type="button" data-action="delete" data-id="${item._id}">Delete</button>
                </div>
            </div>
        </article>
    `;
};

const loadMediaList = async () => {
    if (!adminMediaGrid) {
        return;
    }

    try {
        const response = await fetch(`${GLIMPSE_API_ENDPOINT}?all=true&limit=100`);

        if (!response.ok) {
            throw new Error(`Failed to load media items (${response.status}).`);
        }

        const items = await response.json();
        adminMediaItems = [...items].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

        if (adminMediaItems.length === 0) {
            adminMediaGrid.innerHTML = '<div class="media-placeholder">No media items are stored yet.</div>';
            return;
        }

        adminMediaGrid.innerHTML = adminMediaItems.map(renderMediaCard).join("");
    } catch (error) {
        console.error("Load media list error:", error);
        adminMediaGrid.innerHTML = '<div class="media-placeholder">Unable to load stored media.</div>';
    }
};

if (refreshMediaListBtn) {
    refreshMediaListBtn.addEventListener("click", loadMediaList);
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        setCreateMode();
        if (mediaUploadStatus) {
            mediaUploadStatus.textContent = "Edit cancelled.";
        }
    });
}

if (adminMediaGrid) {
    adminMediaGrid.addEventListener("click", async (event) => {
        const button = event.target instanceof Element ? event.target.closest("button[data-action]") : null;

        if (!button) {
            return;
        }

        const action = button.getAttribute("data-action");
        const mediaId = button.getAttribute("data-id");
        const item = adminMediaItems.find((entry) => entry._id === mediaId);

        if (!action || !mediaId) {
            return;
        }

        if (action === "edit" && item) {
            setEditMode(item);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        if (action === "delete") {
            const confirmed = window.confirm(`Delete "${item?.title || "this media item"}" permanently?`);
            if (!confirmed) {
                return;
            }

            if (mediaUploadStatus) {
                mediaUploadStatus.textContent = "Deleting media...";
            }

            try {
                const response = await fetch(`${GLIMPSE_API_ENDPOINT}/${mediaId}`, {
                    method: "DELETE"
                });

                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(payload?.message || "Delete failed.");
                }

                if (editingMediaId === mediaId) {
                    setCreateMode();
                }

                if (mediaUploadStatus) {
                    mediaUploadStatus.textContent = "Media deleted successfully.";
                }

                await loadMediaList();
            } catch (error) {
                console.error("Delete media error:", error);
                if (mediaUploadStatus) {
                    mediaUploadStatus.textContent = error.message || "Unable to delete media.";
                }
            }
        }
    });
}

if (mediaUploadForm) {
    mediaUploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = getInput("mediaTitle");
        const type = getInput("mediaType");
        const category = getInput("mediaCategory");
        const mediaFile = getInput("mediaFile");
        const thumbnailFile = getInput("thumbnailFile");
        const description = getInput("mediaDescription");
        const eventDate = getInput("mediaEventDate");
        const displayOrder = getInput("mediaDisplayOrder");
        const tags = getInput("mediaTags");
        const featured = getInput("mediaFeatured");
        const published = getInput("mediaPublished");

        if (!title || !type || !category || !mediaFile || !thumbnailFile || !description || !eventDate || !displayOrder || !tags || !featured || !published) {
            return;
        }

        if (!editingMediaId && !mediaFile.files[0]) {
            if (mediaUploadStatus) {
                mediaUploadStatus.textContent = "Media file is required for new uploads.";
            }
            return;
        }

        const formData = new FormData();
        formData.append("title", title.value.trim());
        formData.append("type", type.value);
        formData.append("category", category.value.trim() || "showcase");

        if (mediaFile.files[0]) {
            formData.append("media", mediaFile.files[0]);
        }

        if (thumbnailFile.files[0]) {
            formData.append("thumbnail", thumbnailFile.files[0]);
        }

        formData.append("description", description.value.trim());
        formData.append("eventDate", eventDate.value);
        formData.append("displayOrder", displayOrder.value || "0");
        formData.append("tags", tags.value.trim());
        formData.append("isFeatured", String(featured.checked));
        formData.append("isPublished", String(published.checked));

        if (mediaUploadStatus) {
            mediaUploadStatus.textContent = editingMediaId ? "Updating media..." : "Uploading media...";
        }

        const submitButton = mediaUploadForm.querySelector("button[type='submit']");
        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(
                editingMediaId ? `${GLIMPSE_API_ENDPOINT}/${editingMediaId}` : GLIMPSE_API_ENDPOINT,
                {
                    method: editingMediaId ? "PATCH" : "POST",
                    body: formData
                }
            );

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.message || "Upload failed.");
            }

            const wasEditing = Boolean(editingMediaId);
            setCreateMode();

            if (mediaUploadStatus) {
                mediaUploadStatus.textContent = wasEditing ? "Media updated successfully." : "Media uploaded successfully.";
            }

            await loadMediaList();
        } catch (error) {
            console.error("Upload media error:", error);
            if (mediaUploadStatus) {
                mediaUploadStatus.textContent = error.message || "Unable to upload media.";
            }
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
}

setCreateMode();
loadMediaList();