const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const year = document.getElementById("year");
const openBookingDialogBtn = document.getElementById("openBookingDialogBtn");
const closeBookingDialogBtn = document.getElementById("closeBookingDialogBtn");
const cancelBookingDialogBtn = document.getElementById("cancelBookingDialogBtn");
const bookingDialog = document.getElementById("bookingDialog");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const bookingProgress = document.getElementById("bookingProgress");
const bookingStepOne = document.getElementById("bookingStepOne");
const bookingStepTwo = document.getElementById("bookingStepTwo");
const bookingNextBtn = document.getElementById("bookingNextBtn");
const bookingBackBtn = document.getElementById("bookingBackBtn");
const customerName = document.getElementById("customerName");
const organizationName = document.getElementById("organizationName");
const venue = document.getElementById("venue");
const availableDate = document.getElementById("availableDate");
const availableTime = document.getElementById("availableTime");
const copyUpiDialogBtn = document.getElementById("copyUpiDialogBtn");
const upiIdDialog = document.getElementById("upiIdDialog");
const openReviewDialogBtn = document.getElementById("openReviewDialogBtn");
const closeReviewDialogBtn = document.getElementById("closeReviewDialogBtn");
const cancelReviewDialogBtn = document.getElementById("cancelReviewDialogBtn");
const reviewDialog = document.getElementById("reviewDialog");
const reviewForm = document.getElementById("reviewForm");
const reviewMessage = document.getElementById("reviewMessage");
const reviewName = document.getElementById("reviewName");
const reviewOrganizationName = document.getElementById("reviewOrganizationName");
const reviewRating = document.getElementById("reviewRating");
const reviewMessageInput = document.getElementById("reviewMessageInput");
const instagramDropdown = document.getElementById("instagramDropdown");
const instagramToggleBtn = document.getElementById("instagramToggleBtn");
const instagramAccountsMenu = document.getElementById("instagramAccountsMenu");
const glimpseCarousel = document.getElementById("glimpseCarousel");
const glimpseCarouselContent = document.getElementById("glimpseCarouselContent");
const glimpseCarouselPrev = document.getElementById("glimpseCarouselPrev");
const glimpseCarouselNext = document.getElementById("glimpseCarouselNext");
const BOOKING_API_ENDPOINT = "/api/bookings";
const REVIEW_API_ENDPOINT = "/api/reviews";
const GLIMPSE_API_ENDPOINT = "/api/glimpses";

const submitBookingToBackend = async (payload) => {
    const response = await fetch(BOOKING_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Booking backend request failed with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
};

const submitReviewToBackend = async (payload) => {
    const response = await fetch(REVIEW_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Review backend request failed with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
};

if (year) {
    year.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if (copyUpiDialogBtn && upiIdDialog) {
    copyUpiDialogBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(upiIdDialog.textContent || "");
            copyUpiDialogBtn.textContent = "UPI ID Copied";
            setTimeout(() => {
                copyUpiDialogBtn.textContent = "Copy UPI ID";
            }, 1500);
        } catch (error) {
            console.error("Failed to copy UPI ID:", error);
            copyUpiDialogBtn.textContent = "Copy Failed";
            setTimeout(() => {
                copyUpiDialogBtn.textContent = "Copy UPI ID";
            }, 1500);
        }
    });
}

const setBookingStep = (stepNumber) => {
    if (!bookingStepOne || !bookingStepTwo) return;
    const showStepOne = stepNumber === 1;
    bookingStepOne.hidden = !showStepOne;
    bookingStepTwo.hidden = showStepOne;

    if (bookingProgress) {
        bookingProgress.textContent = showStepOne ? "Step 1 of 2: Show Details" : "Step 2 of 2: Payment Method";
    }

    if (showStepOne && customerName) {
        customerName.focus();
    }

    if (!showStepOne && bookingForm) {
        const firstPaymentOption = bookingForm.querySelector("input[name='paymentMethod']");
        if (firstPaymentOption instanceof HTMLElement) {
            firstPaymentOption.focus();
        }
    }
};

const resetBookingFlow = () => {
    if (bookingForm) {
        bookingForm.reset();
    }
    if (bookingMessage) {
        bookingMessage.textContent = "";
    }
    if (copyUpiDialogBtn) {
        copyUpiDialogBtn.textContent = "Copy UPI ID";
    }
    setBookingStep(1);
};

const openBookingDialog = () => {
    if (!bookingDialog) return;
    resetBookingFlow();
    bookingDialog.hidden = false;
    syncBodyScrollState();
};

const closeBookingDialog = () => {
    if (!bookingDialog) return;
    bookingDialog.hidden = true;
    syncBodyScrollState();
};

const syncBodyScrollState = () => {
    const bookingOpen = bookingDialog && !bookingDialog.hidden;
    const reviewOpen = reviewDialog && !reviewDialog.hidden;
    document.body.classList.toggle("no-scroll", Boolean(bookingOpen || reviewOpen));
};

const resetReviewFlow = () => {
    if (reviewForm) {
        reviewForm.reset();
    }
    if (reviewMessage) {
        reviewMessage.textContent = "";
    }
};

const openReviewDialog = () => {
    if (!reviewDialog) return;
    resetReviewFlow();
    reviewDialog.hidden = false;
    syncBodyScrollState();
    if (reviewName) {
        reviewName.focus();
    }
};

const closeReviewDialog = () => {
    if (!reviewDialog) return;
    reviewDialog.hidden = true;
    syncBodyScrollState();
};

const closeInstagramMenu = () => {
    if (!instagramAccountsMenu || !instagramToggleBtn) return;
    instagramAccountsMenu.hidden = true;
    instagramToggleBtn.setAttribute("aria-expanded", "false");
};

// Glimpse Carousel
let glimpseAutoScrollInterval = null;

const startGlimpseAutoScroll = () => {
    if (glimpseAutoScrollInterval) {
        clearInterval(glimpseAutoScrollInterval);
    }

    glimpseAutoScrollInterval = setInterval(() => {
        if (!glimpseCarousel) {
            return;
        }

        const isAtEnd = glimpseCarousel.scrollLeft + glimpseCarousel.clientWidth >= glimpseCarousel.scrollWidth - 10;

        if (isAtEnd) {
            glimpseCarousel.scrollTo({ left: 0, behavior: "smooth" });
            return;
        }

        glimpseCarousel.scrollBy({ left: 380, behavior: "smooth" });
    }, 4500);
};

const stopGlimpseAutoScroll = () => {
    if (glimpseAutoScrollInterval) {
        clearInterval(glimpseAutoScrollInterval);
        glimpseAutoScrollInterval = null;
    }
};

const updateGlimpseCarouselButtons = () => {
    if (!glimpseCarousel) return;

    const isAtStart = glimpseCarousel.scrollLeft <= 0;
    const isAtEnd = glimpseCarousel.scrollLeft + glimpseCarousel.clientWidth >= glimpseCarousel.scrollWidth - 10;

    if (glimpseCarouselPrev) {
        glimpseCarouselPrev.disabled = isAtStart;
    }

    if (glimpseCarouselNext) {
        glimpseCarouselNext.disabled = isAtEnd;
    }
};

const renderGlimpseMedia = (glimpse) => {
    const mediaUrl = glimpse.mediaUrl || glimpse.url || "";
    const thumbnailUrl = glimpse.thumbnailUrl || "";

    if (glimpse.type === "video") {
        return `
            <div class="glimpse-media">
                <video controls preload="metadata" ${thumbnailUrl ? `poster="${thumbnailUrl}"` : ""}>
                    <source src="${mediaUrl}" type="${escapeHtml(glimpse.media?.contentType || "video/mp4")}">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }

    return `
        <div class="glimpse-media">
            <img src="${mediaUrl}" alt="${escapeHtml(glimpse.title)}">
        </div>
    `;
};

const loadGlimpseCarousel = async () => {
    try {
        const response = await fetch(`${GLIMPSE_API_ENDPOINT}?limit=100`);

        if (!response.ok) {
            throw new Error(`Glimpse backend request failed with status ${response.status}.`);
        }

        const glimpses = await response.json();

        if (!Array.isArray(glimpses) || glimpses.length === 0) {
            if (glimpseCarouselContent) {
                glimpseCarouselContent.innerHTML = '<div class="media-placeholder">No glimpses available yet.</div>';
            }
            stopGlimpseAutoScroll();
            return;
        }

        const sortedGlimpses = [...glimpses].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

        if (glimpseCarouselContent) {
            glimpseCarouselContent.innerHTML = sortedGlimpses
                .map((glimpse) => `
                    <article class="glimpse-card">
                        ${renderGlimpseMedia(glimpse)}
                        <div class="glimpse-body">
                            <div class="glimpse-meta">
                                <span class="glimpse-tag">${escapeHtml(glimpse.category || "showcase")}</span>
                                <span class="glimpse-date">${formatDate(glimpse.createdAt)}</span>
                            </div>
                            <h3 class="glimpse-title">${escapeHtml(glimpse.title)}</h3>
                            <p class="glimpse-description">${escapeHtml(glimpse.description || "")}</p>
                        </div>
                    </article>
                `)
                .join("");
        }

        updateGlimpseCarouselButtons();
        startGlimpseAutoScroll();
    } catch (error) {
        console.error("Error loading glimpse carousel:", error);
        if (glimpseCarouselContent) {
            glimpseCarouselContent.innerHTML = '<div class="media-placeholder">Unable to load glimpses. Please try again later.</div>';
        }
        stopGlimpseAutoScroll();
    }
};

if (glimpseCarouselPrev) {
    glimpseCarouselPrev.addEventListener("click", () => {
        if (!glimpseCarousel) return;

        stopGlimpseAutoScroll();
        glimpseCarousel.scrollBy({ left: -380, behavior: "smooth" });
        setTimeout(updateGlimpseCarouselButtons, 300);
        setTimeout(startGlimpseAutoScroll, 300);
    });
}

if (glimpseCarouselNext) {
    glimpseCarouselNext.addEventListener("click", () => {
        if (!glimpseCarousel) return;

        stopGlimpseAutoScroll();
        glimpseCarousel.scrollBy({ left: 380, behavior: "smooth" });
        setTimeout(updateGlimpseCarouselButtons, 300);
        setTimeout(startGlimpseAutoScroll, 300);
    });
}

if (glimpseCarousel) {
    glimpseCarousel.addEventListener("scroll", () => {
        updateGlimpseCarouselButtons();
    });

    glimpseCarousel.addEventListener("mouseenter", stopGlimpseAutoScroll);
    glimpseCarousel.addEventListener("mouseleave", startGlimpseAutoScroll);
}

const glimpseCarouselShell = document.querySelector(".glimpse-carousel-shell");

if (glimpseCarouselShell) {
    glimpseCarouselShell.addEventListener("mouseenter", stopGlimpseAutoScroll);
    glimpseCarouselShell.addEventListener("mouseleave", startGlimpseAutoScroll);
}

if (openBookingDialogBtn) {
    openBookingDialogBtn.addEventListener("click", openBookingDialog);
}

if (closeBookingDialogBtn) {
    closeBookingDialogBtn.addEventListener("click", closeBookingDialog);
}

if (cancelBookingDialogBtn) {
    cancelBookingDialogBtn.addEventListener("click", closeBookingDialog);
}

if (openReviewDialogBtn) {
    openReviewDialogBtn.addEventListener("click", openReviewDialog);
}

if (closeReviewDialogBtn) {
    closeReviewDialogBtn.addEventListener("click", closeReviewDialog);
}

if (cancelReviewDialogBtn) {
    cancelReviewDialogBtn.addEventListener("click", closeReviewDialog);
}

if (bookingNextBtn) {
    bookingNextBtn.addEventListener("click", () => {
        const stepOneFields = [customerName, organizationName, venue, availableDate, availableTime];
        const invalidField = stepOneFields.find((field) => field && !field.reportValidity());
        if (!invalidField) {
            setBookingStep(2);
        }
    });
}

if (bookingBackBtn) {
    bookingBackBtn.addEventListener("click", () => {
        setBookingStep(1);
    });
}

if (instagramToggleBtn && instagramAccountsMenu) {
    instagramToggleBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isHidden = instagramAccountsMenu.hidden;
        instagramAccountsMenu.hidden = !isHidden;
        instagramToggleBtn.setAttribute("aria-expanded", String(isHidden));
    });
}

if (instagramAccountsMenu) {
    instagramAccountsMenu.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("a")) {
            closeInstagramMenu();
        }
    });
}

document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const closeTrigger = event.target.closest("[data-close-booking='true']");
    if (closeTrigger) {
        closeBookingDialog();
    }

    const closeReviewTrigger = event.target.closest("[data-close-review='true']");
    if (closeReviewTrigger) {
        closeReviewDialog();
    }

    if (instagramDropdown && !instagramDropdown.contains(event.target)) {
        closeInstagramMenu();
    }
});

if (bookingDialog) {
    bookingDialog.addEventListener("click", (event) => {
        if (event.target === bookingDialog) {
            closeBookingDialog();
        }
    });
}

if (reviewDialog) {
    reviewDialog.addEventListener("click", (event) => {
        if (event.target === reviewDialog) {
            closeReviewDialog();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bookingDialog && !bookingDialog.hidden) {
        closeBookingDialog();
    }

    if (event.key === "Escape" && reviewDialog && !reviewDialog.hidden) {
        closeReviewDialog();
    }

    if (event.key === "Escape") {
        closeInstagramMenu();
    }
});

if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const selectedPaymentMethod = bookingForm.querySelector("input[name='paymentMethod']:checked");

        if (!selectedPaymentMethod) {
            const firstPaymentOption = bookingForm.querySelector("input[name='paymentMethod']");
            if (firstPaymentOption instanceof HTMLInputElement) {
                firstPaymentOption.reportValidity();
            }
            return;
        }

        const submitBookingBtn = bookingForm.querySelector("button[type='submit']");
        if (submitBookingBtn instanceof HTMLButtonElement) {
            submitBookingBtn.disabled = true;
        }

        const payload = {
            customerName: customerName ? customerName.value.trim() : "",
            organizationName: organizationName ? organizationName.value.trim() : "",
            venue: venue ? venue.value.trim() : "",
            availableDate: availableDate ? availableDate.value : "",
            availableTime: availableTime ? availableTime.value : "",
            paymentMethod: selectedPaymentMethod.value,
            timezone: "Asia/Kolkata",
            calendar: {
                createEvent: true,
                reminders: [
                    { method: "popup", minutesBefore: 1440 },
                    { method: "popup", minutesBefore: 60 }
                ]
            }
        };

        try {
            const backendResponse = await submitBookingToBackend(payload);
            if (bookingMessage) {
                bookingMessage.textContent = backendResponse?.message || "Booking submitted. Backend will create Google Calendar event and reminders.";
            }

            setTimeout(() => {
                closeBookingDialog();
                resetBookingFlow();
            }, 1200);
        } catch (error) {
            console.error("Booking backend error:", error);
            if (bookingMessage) {
                bookingMessage.textContent = "Could not submit booking to backend. Please try again.";
            }
        } finally {
            if (submitBookingBtn instanceof HTMLButtonElement) {
                submitBookingBtn.disabled = false;
            }
        }
    });
}

if (reviewForm) {
    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitReviewBtn = reviewForm.querySelector("button[type='submit']");
        if (submitReviewBtn instanceof HTMLButtonElement) {
            submitReviewBtn.disabled = true;
        }

        const payload = {
            name: reviewName ? reviewName.value.trim() : "",
            organizationName: reviewOrganizationName ? reviewOrganizationName.value.trim() : "",
            rating: reviewRating ? Number(reviewRating.value) : 0,
            message: reviewMessageInput ? reviewMessageInput.value.trim() : "",
            source: "website"
        };

        try {
            const backendResponse = await submitReviewToBackend(payload);
            if (reviewMessage) {
                reviewMessage.textContent = backendResponse?.message || "Review submitted successfully.";
            }

            setTimeout(() => {
                closeReviewDialog();
                resetReviewFlow();
            }, 1200);
        } catch (error) {
            console.error("Review backend error:", error);
            if (reviewMessage) {
                reviewMessage.textContent = "Could not submit review. Please try again.";
            }
        } finally {
            if (submitReviewBtn instanceof HTMLButtonElement) {
                submitReviewBtn.disabled = false;
            }
        }
    });
}

// Reviews Carousel
const reviewsCarousel = document.getElementById("reviewsCarousel");
const reviewsCarouselContent = document.getElementById("reviewsCarouselContent");
const reviewsCarouselPrev = document.getElementById("reviewsCarouselPrev");
const reviewsCarouselNext = document.getElementById("reviewsCarouselNext");
let autoScrollInterval = null;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const startAutoScroll = () => {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    
    autoScrollInterval = setInterval(() => {
        if (reviewsCarousel) {
            const isAtEnd = reviewsCarousel.scrollLeft + reviewsCarousel.clientWidth >= reviewsCarousel.scrollWidth - 10;
            
            if (isAtEnd) {
                // Scroll back to start
                reviewsCarousel.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                // Scroll right
                reviewsCarousel.scrollBy({ left: 350, behavior: "smooth" });
            }
        }
    }, 4000); // Auto-scroll every 4 seconds
};

const stopAutoScroll = () => {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
};

const loadReviewsCarousel = async () => {
    try {
        // Fetch all reviews (including unapproved/unpublished)
        const response = await fetch(REVIEW_API_ENDPOINT + "?all=true");
        if (!response.ok) {
            throw new Error("Failed to fetch reviews");
        }

        let reviews = await response.json();
        
        // Sort by date - newest first
        reviews = reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Filter reviews with rating >= 4
        const filteredReviews = reviews.filter(review => review.rating >= 4);

        if (filteredReviews.length === 0) {
            reviewsCarouselContent.innerHTML = '<div class="review-placeholder">No reviews yet. Be the first to share your experience!</div>';
            stopAutoScroll();
            return;
        }

        // Render review cards
        reviewsCarouselContent.innerHTML = filteredReviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div>
                        <p class="review-name">${escapeHtml(review.name)}</p>
                        ${review.organizationName ? `<p class="review-organization">${escapeHtml(review.organizationName)}</p>` : ''}
                        <p class="review-date">${formatDate(review.createdAt)}</p>
                    </div>
                    <div class="review-rating">
                        ${Array.from({ length: review.rating }, () => '<span class="star">★</span>').join('')}
                    </div>
                </div>
                <p class="review-text">"${escapeHtml(review.message)}"</p>
            </div>
        `).join('');

        updateCarouselButtons();
        startAutoScroll();
    } catch (error) {
        console.error("Error loading reviews carousel:", error);
        reviewsCarouselContent.innerHTML = '<div class="review-placeholder">Unable to load reviews. Please try again later.</div>';
        stopAutoScroll();
    }
};

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const updateCarouselButtons = () => {
    if (!reviewsCarousel) return;
    
    const isAtStart = reviewsCarousel.scrollLeft <= 0;
    const isAtEnd = reviewsCarousel.scrollLeft + reviewsCarousel.clientWidth >= reviewsCarousel.scrollWidth - 10;
    
    if (reviewsCarouselPrev) {
        reviewsCarouselPrev.disabled = isAtStart;
    }
    if (reviewsCarouselNext) {
        reviewsCarouselNext.disabled = isAtEnd;
    }
};

if (reviewsCarouselPrev) {
    reviewsCarouselPrev.addEventListener("click", () => {
        if (reviewsCarousel) {
            stopAutoScroll();
            reviewsCarousel.scrollBy({ left: -350, behavior: "smooth" });
            setTimeout(updateCarouselButtons, 300);
            setTimeout(startAutoScroll, 300); // Resume auto-scroll after manual scroll
        }
    });
}

if (reviewsCarouselNext) {
    reviewsCarouselNext.addEventListener("click", () => {
        if (reviewsCarousel) {
            stopAutoScroll();
            reviewsCarousel.scrollBy({ left: 350, behavior: "smooth" });
            setTimeout(updateCarouselButtons, 300);
            setTimeout(startAutoScroll, 300); // Resume auto-scroll after manual scroll
        }
    });
}

if (reviewsCarousel) {
    reviewsCarousel.addEventListener("scroll", () => {
        updateCarouselButtons();
    });

    reviewsCarousel.addEventListener("mouseenter", stopAutoScroll);
    reviewsCarousel.addEventListener("mouseleave", startAutoScroll);
}

const reviewsCarouselWrapper = document.querySelector(".reviews-carousel-wrapper");

if (reviewsCarouselWrapper) {
    reviewsCarouselWrapper.addEventListener("mouseenter", stopAutoScroll);
    reviewsCarouselWrapper.addEventListener("mouseleave", startAutoScroll);
}

// Load reviews carousel on page load
window.addEventListener("load", () => {
    loadGlimpseCarousel();
    loadReviewsCarousel();
});
