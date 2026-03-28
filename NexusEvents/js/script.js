const NexusApp = {
    init() {
        this.initNavigation();
        this.initLogin();
        this.initTicketFlow();
        this.initDashboardActions();
    },

    initNavigation() {
        const toggle = document.querySelector("[data-nav-toggle]");
        const nav = document.querySelector("[data-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 720) {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    },

    initLogin() {
        const loginForm = document.getElementById("login-form");
        const message = document.querySelector("[data-login-message]");

        if (!loginForm || !message) {
            return;
        }

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const username = document.getElementById("username")?.value.trim().toLowerCase();
            const password = document.getElementById("password")?.value.trim();

            if (!username || !password) {
                message.textContent = "Enter username and password.";
                return;
            }

            if (username === "admin") {
                message.textContent = "Access granted. Opening dashboard...";
                window.location.href = "admin.html";
                return;
            }

            message.textContent = "Use the admin username to continue.";
        });
    },

    initTicketFlow() {
        const eventSelect = document.getElementById("event-type");
        const attendeeName = document.getElementById("attendee-name");
        const attendeeEmail = document.getElementById("attendee-email");
        const ticketButtons = document.querySelectorAll("[data-ticket-button]");
        const reviewEvent = document.getElementById("review-event");
        const reviewTier = document.getElementById("review-tier");
        const reviewStatus = document.getElementById("review-status");
        const generateButton = document.getElementById("generate-qr-button");
        const qrImage = document.getElementById("ticket-qr");
        const qrPlaceholder = document.getElementById("qr-placeholder");

        if (!eventSelect || !attendeeName || !attendeeEmail || !reviewEvent || !reviewTier || !reviewStatus || !generateButton || !qrImage || !qrPlaceholder || ticketButtons.length === 0) {
            return;
        }

        let selectedTier = "Standard";

        const updateReview = () => {
            reviewEvent.textContent = eventSelect.value;
            reviewTier.textContent = selectedTier;

            if (attendeeName.value.trim() && attendeeEmail.value.trim()) {
                reviewStatus.textContent = "Ready for QR generation";
            } else {
                reviewStatus.textContent = "Waiting for attendee details";
            }
        };

        ticketButtons.forEach((button) => {
            button.addEventListener("click", () => {
                ticketButtons.forEach((item) => item.classList.remove("is-selected"));
                button.classList.add("is-selected");
                selectedTier = button.dataset.ticketTier || "Standard";
                updateReview();
            });
        });

        [eventSelect, attendeeName, attendeeEmail].forEach((field) => {
            field.addEventListener("input", updateReview);
            field.addEventListener("change", updateReview);
        });

        generateButton.addEventListener("click", () => {
            const name = attendeeName.value.trim();
            const email = attendeeEmail.value.trim();

            if (!name || !email) {
                reviewStatus.textContent = "Enter attendee details first";
                qrImage.hidden = true;
                qrPlaceholder.hidden = false;
                qrPlaceholder.textContent = "Complete the fields, then generate the QR code.";
                return;
            }

            const qrPayload = `Nexus Events | Event: ${eventSelect.value} | Tier: ${selectedTier} | Name: ${name} | Email: ${email}`;
            qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
            qrImage.hidden = false;
            qrPlaceholder.hidden = true;
            reviewStatus.textContent = "QR code generated";
        });

        updateReview();
    },

    initDashboardActions() {
        const actionButtons = document.querySelectorAll("[data-dashboard-action]");
        const primaryTitle = document.getElementById("dashboard-primary-title");
        const primaryList = document.getElementById("dashboard-primary-list");
        const secondaryTitle = document.getElementById("dashboard-secondary-title");
        const secondaryList = document.getElementById("dashboard-secondary-list");

        if (!primaryTitle || !primaryList || !secondaryTitle || !secondaryList || actionButtons.length === 0) {
            return;
        }

        const dashboardViews = {
            events: {
                primaryTitle: "Recent Activity",
                primaryItems: [
                    "<li><span class=\"highlight\">09:00</span> Workshop registration opened</li>",
                    "<li><span class=\"highlight\">11:30</span> New VIP bookings were confirmed</li>",
                    "<li><span class=\"highlight\">14:15</span> Speaker profile details were updated</li>"
                ],
                secondaryTitle: "Event Status",
                secondaryItems: [
                    "<li><span class=\"highlight\">Concert Night:</span> Stage checks in progress</li>",
                    "<li><span class=\"highlight\">Design Summit:</span> Ready for attendee check-in</li>",
                    "<li><span class=\"highlight\">Creator Meetup:</span> Awaiting final room setup</li>"
                ]
            },
            users: {
                primaryTitle: "User Activity",
                primaryItems: [
                    "<li><span class=\"highlight\">08:45</span> Three new accounts were created</li>",
                    "<li><span class=\"highlight\">10:20</span> Two attendee profiles were updated</li>",
                    "<li><span class=\"highlight\">13:10</span> One organizer account was approved</li>"
                ],
                secondaryTitle: "User Status",
                secondaryItems: [
                    "<li><span class=\"highlight\">Admins:</span> 4 active users</li>",
                    "<li><span class=\"highlight\">Organizers:</span> 9 verified users</li>",
                    "<li><span class=\"highlight\">Attendees:</span> 348 registered users</li>"
                ]
            },
            reports: {
                primaryTitle: "Report Activity",
                primaryItems: [
                    "<li><span class=\"highlight\">09:30</span> Ticket sales report was exported</li>",
                    "<li><span class=\"highlight\">12:00</span> Attendance report was refreshed</li>",
                    "<li><span class=\"highlight\">15:40</span> Summary report was prepared</li>"
                ],
                secondaryTitle: "Report Status",
                secondaryItems: [
                    "<li><span class=\"highlight\">Sales:</span> Ready for review</li>",
                    "<li><span class=\"highlight\">Attendance:</span> Updated with latest entries</li>",
                    "<li><span class=\"highlight\">Revenue:</span> Pending final approval</li>"
                ]
            }
        };

        actionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.dashboardAction;
                const selectedView = dashboardViews[action];

                if (!selectedView) {
                    return;
                }

                actionButtons.forEach((item) => item.classList.remove("is-selected"));
                button.classList.add("is-selected");

                primaryTitle.textContent = selectedView.primaryTitle;
                primaryList.innerHTML = selectedView.primaryItems.join("");
                secondaryTitle.textContent = selectedView.secondaryTitle;
                secondaryList.innerHTML = selectedView.secondaryItems.join("");
            });
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    NexusApp.init();
});
