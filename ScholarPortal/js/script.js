(function () {
  const catalog = [
    { id: 1, code: "PCDL111", title: "PC Assembly, Troubleshooting, and Maintenance with Digital Logics", schedule: "M 10:20AM-01:20PM", section: "BSCS 1-Y2-1-TAM 501", lecLab: "3.0/0.0", units: 3, fee: 5550 },
    { id: 2, code: "ALGO211", title: "Algorithms and Complexity", schedule: "M 04:50PM-07:50PM", section: "BSCS 2-Y2-1-TAM 504", lecLab: "3.0/0.0", units: 3, fee: 5550 },
    { id: 3, code: "DCAL211", title: "Differential Calculus", schedule: "T 04:50PM-07:50PM", section: "BSCS 2-Y2-1-TAM 505", lecLab: "3.0/0.0", units: 3, fee: 5550 },
    { id: 4, code: "DIMM212", title: "Discrete Mathematics 2", schedule: "TH 04:50PM-07:50PM", section: "BSCS 2-Y2-1-TAM 501", lecLab: "3.0/0.0", units: 3, fee: 5550 },
    { id: 5, code: "IMGT211", title: "Information Management with Lab", schedule: "F 10:20AM-01:20PM (lab) / 08:00AM-10:00AM", section: "BSCS 2-Y2-1-TAM 505, TAM CL1", lecLab: "2.0/1.0", units: 3, fee: 6750 },
    { id: 6, code: "LFAD211", title: "Linux Fundamentals and Administration with Lab", schedule: "F 04:50PM-06:50PM / 01:30PM-04:30PM (lab)", section: "BSCS 2-Y2-1-TAM 508, TAM 504", lecLab: "2.0/1.0", units: 3, fee: 6750 },
    { id: 7, code: "OOPR212", title: "Object Oriented Programming II with Lab", schedule: "T 10:20AM-01:20PM (lab) / 08:00AM-10:00AM", section: "BSCS 2-Y2-1-TAM 504, TAM CL1", lecLab: "2.0/1.0", units: 3, fee: 6750 },
    { id: 8, code: "VRTS114", title: "Veritas et Misericordia 4", schedule: "S 04:50PM-05:50PM", section: "BSCS 2-Y2-1-OCR", lecLab: "1.0/0.0", units: 1, fee: 1850 },
    { id: 9, code: "VRTS112", title: "Veritas et Misericordia 2", schedule: "S 10:20AM-11:20AM", section: "BSIT 1-Y2-2-OCR", lecLab: "1.0/0.0", units: 1, fee: 1850 },
    { id: 10, code: "WBDV111", title: "Web Development with Lab", schedule: "TH 10:20AM-12:20PM / 07:00AM-10:00AM (lab)", section: "BSIT 1-Y2-5-TAM CL2, TAM 504", lecLab: "2.0/1.0", units: 3, fee: 6750 },
    { id: 11, code: "PHED214", title: "Physical Education 4", schedule: "W 11:20AM-01:20PM", section: "BSIT 2-Y2-2-RISE TOWER", lecLab: "2.0/0.0", units: 2, fee: 3700 }
  ];


  const storageKey = "scholarPortalSemester";

  function money(value) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2
    }).format(value);
  }

  function readState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { selectedIds: [], paid: false, paidAt: "" };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
        paid: Boolean(parsed.paid),
        paidAt: parsed.paidAt || ""
      };
    } catch (error) {
      return { selectedIds: [], paid: false, paidAt: "" };
    }
  }

  function writeState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function getSelectedCourses() {
    return catalog.filter((course) => state.selectedIds.includes(course.id));
  }

  function renderCatalog() {
    catalogEl.innerHTML = catalog.map((course) => {
      const selected = state.selectedIds.includes(course.id);
      return `
        <article class="course-card">
          <div class="course-code">${course.code}</div>
          <h3 class="course-title">${course.title}</h3>
          <p class="course-meta course-meta-schedule">${course.schedule}</p>
          <p class="course-meta course-meta-section">${course.section}</p>
          <p class="course-meta course-meta-footer">${course.lecLab} lec/lab • ${course.units} units • ${money(course.fee)}</p>
          <button type="button" data-action="${selected ? "remove" : "add"}" data-id="${course.id}">
            ${selected ? "Remove Subject" : "Add to Semester"}
          </button>
        </article>
      `;
    }).join("");
  }

  function renderSemester() {
    const selected = getSelectedCourses();

    if (!selected.length) {
      semesterEl.innerHTML = '<p class="empty">No courses added yet.</p>';
    } else {
      semesterEl.innerHTML = selected.map((course) => `
        <article class="semester-item">
          <div>
            <p><strong>${course.code}</strong> - ${course.title}</p>
            <p class="mini">${course.schedule}</p>
            <p class="mini">${course.units} units • ${money(course.fee)}</p>
          </div>
          <button type="button" data-action="remove" data-id="${course.id}">Remove</button>
        </article>
      `).join("");
    }

    const totalUnits = selected.reduce((sum, item) => sum + item.units, 0);
    const totalFee = selected.reduce((sum, item) => sum + item.fee, 0);
    totalUnitsEl.textContent = String(totalUnits);
    totalFeeEl.textContent = money(totalFee);

    if (!selected.length) {
      paymentStatusEl.textContent = "Add courses first before paying fees.";
      paymentStatusEl.className = "status-line warn";
      state.paid = false;
      state.paidAt = "";
      writeState();
    }
  }

  function renderTranscript() {
    const selected = getSelectedCourses();
    const available = catalog.filter((course) => !state.selectedIds.includes(course.id));
    const statusLabel = state.paid ? "Enrolled" : "Pending Payment";
    const takenHistorySafe = Array.isArray(globalThis.takenHistory) ? globalThis.takenHistory : [];

    availableCoursesEl.innerHTML = available.length
      ? available.map((course) => `<li>${course.code} - ${course.title}</li>`).join("")
      : "<li>No more available courses this term.</li>";

    const takenNow = selected.map((course) => `${course.code} - ${course.title} (${statusLabel})`);
    const allTaken = [...takenHistorySafe, ...takenNow].map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object") {
        if (item.code && item.title) {
          return item.code + " - " + item.title;
        }
        return JSON.stringify(item);
      }
      return String(item);
    });
    takenCoursesEl.innerHTML = allTaken.length
      ? allTaken.map((item) => `<li>${item}</li>`).join("")
      : "<li>No taken courses yet.</li>";
  }

  function refreshAll() {
    renderCatalog();
    renderSemester();
    renderTranscript();
  }

  function onCatalogClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    const id = Number(button.dataset.id);
    if (button.dataset.action === "add" && !state.selectedIds.includes(id)) {
      state.selectedIds.push(id);
      state.paid = false;
      state.paidAt = "";
      writeState();
      refreshAll();
      paymentStatusEl.textContent = "Course added to semester.";
      paymentStatusEl.className = "status-line ok";
    }
    if (button.dataset.action === "remove") {
      state.selectedIds = state.selectedIds.filter((courseId) => courseId !== id);
      state.paid = false;
      state.paidAt = "";
      writeState();
      refreshAll();
      paymentStatusEl.textContent = "Course removed from semester.";
      paymentStatusEl.className = "status-line warn";
    }
  }

  function onSemesterClick(event) {
    const button = event.target.closest("button[data-action='remove']");
    if (!button) {
      return;
    }
    const id = Number(button.dataset.id);
    state.selectedIds = state.selectedIds.filter((courseId) => courseId !== id);
    state.paid = false;
    state.paidAt = "";
    writeState();
    refreshAll();
    paymentStatusEl.textContent = "Course removed from semester.";
    paymentStatusEl.className = "status-line warn";
  }

  function payFees() {
    const selected = getSelectedCourses();
    if (!selected.length) {
      paymentStatusEl.textContent = "No courses selected. Add modules first.";
      paymentStatusEl.className = "status-line warn";
      return;
    }

    const totalFee = selected.reduce((sum, item) => sum + item.fee, 0);
    state.paid = true;
    state.paidAt = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    writeState();

    paymentStatusEl.textContent = "Payment received: " + money(totalFee) + " on " + state.paidAt + ".";
    paymentStatusEl.className = "status-line ok";
    renderTranscript();
  }

  function addAllCourses() {
    state.selectedIds = catalog.map((course) => course.id);
    state.paid = false;
    state.paidAt = "";
    writeState();
    refreshAll();
    paymentStatusEl.textContent = "All subjects added to semester.";
    paymentStatusEl.className = "status-line ok";
  }

  function removeAllCourses() {
    state.selectedIds = [];
    state.paid = false;
    state.paidAt = "";
    writeState();
    refreshAll();
    paymentStatusEl.textContent = "All subjects removed from semester.";
    paymentStatusEl.className = "status-line warn";
  }

  const body = document.body;
  if (!body.classList.contains("page-scholar")) {
    return;
  }

  const catalogEl = document.getElementById("course-catalog");
  const semesterEl = document.getElementById("semester-list");
  const totalUnitsEl = document.getElementById("total-units");
  const totalFeeEl = document.getElementById("total-fee");
  const payFeesBtn = document.getElementById("pay-fees-btn");
  const addAllBtn = document.getElementById("add-all-btn");
  const removeAllBtn = document.getElementById("remove-all-btn");
  const paymentStatusEl = document.getElementById("payment-status");
  const availableCoursesEl = document.getElementById("available-courses");
  const takenCoursesEl = document.getElementById("taken-courses");
  const transcriptSection = document.getElementById("transcript");
  const viewTranscriptBtn = document.getElementById("view-transcript-btn");
  const logoutLinks = document.querySelectorAll(".logout-link");

  const state = readState();
  refreshAll();

  catalogEl.addEventListener("click", onCatalogClick);
  semesterEl.addEventListener("click", onSemesterClick);
  payFeesBtn.addEventListener("click", payFees);
  addAllBtn.addEventListener("click", addAllCourses);
  removeAllBtn.addEventListener("click", removeAllCourses);

  viewTranscriptBtn.addEventListener("click", () => {
    transcriptSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  logoutLinks.forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
    });
  });
})();
