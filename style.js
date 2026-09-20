/* =====================================================
   COMPLIANCEAI - SHARED UI
   Loaded by index.html and result.html
   (scanner logic lives in scanner.js only)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------
       ANIMATED STAT NUMBERS (dashboard)
    ----------------------------------------------- */

    document.querySelectorAll(".stat-content h2").forEach(element => {

        const target = parseFloat(element.dataset.value);
        if (isNaN(target)) return;

        /* decide the suffix ONCE, from the initial markup */
        const suffix = element.textContent.trim().endsWith("%") ? "%" : "";
        const decimals = target % 1 !== 0 ? 1 : 0;

        const duration = 1200;
        const startTime = performance.now();

        function animate(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;

            element.textContent = value.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(animate);
    });

    /* -----------------------------------------------
       SIDEBAR NAV
    ----------------------------------------------- */

    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            if (this.getAttribute("href") === "#") {
                event.preventDefault();
                return;
            }
            navLinks.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
        });
    });

    /* -----------------------------------------------
       RESULT PAGE
    ----------------------------------------------- */

    const resultScore = document.getElementById("resultScore");

    if (resultScore) {
        const stored = localStorage.getItem("complianceReport");

        if (stored) {
            try {
                updateResultPage(JSON.parse(stored));
            } catch (error) {
                console.warn("Stored report data is not valid JSON.");
            }
        }
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null && value !== "") {
            element.textContent = value;
        }
    }

    function updateResultPage(data) {

        setText("productName", data.productName);
        setText("productCategory", data.category);
        setText("mrp", data.mrp);
        setText("quantity", data.quantity);
        setText("manufacturer", data.manufacturer);
        setText("inspectionId", data.inspectionId);

        const score = Number(data.score);
        if (!isNaN(score)) setText("resultScore", score + "%");

        /* product image */
        const resultImage = document.getElementById("resultProductImage");
        if (resultImage && data.image) {
            const img = document.createElement("img");
            img.src = data.image;
            img.alt = "Scanned product";
            resultImage.innerHTML = "";
            resultImage.appendChild(img);
        }

        /* score ring — must be a single-line gradient string */
        const resultCircle = document.getElementById("resultCircle");
        if (resultCircle && !isNaN(score)) {
            const degrees = score * 3.6;
            const color = score < 75 ? "#ef4444" : "#22c55e";
            resultCircle.style.background =
                `conic-gradient(${color} 0deg ${degrees}deg, #202938 ${degrees}deg 360deg)`;
        }

        /* status badge — handles both directions */
        const resultStatus = document.getElementById("resultStatus");
        if (resultStatus && !isNaN(score)) {
            if (score < 75) {
                resultStatus.classList.remove("success");
                resultStatus.classList.add("danger");
                resultStatus.innerHTML = "<span>!</span> NON-COMPLIANT";
            } else {
                resultStatus.classList.remove("danger");
                resultStatus.classList.add("success");
                resultStatus.innerHTML = "<span>✓</span> COMPLIANT";
            }
        }
    }

    /* -----------------------------------------------
       REPORT BUTTONS
    ----------------------------------------------- */

    const newScan = document.getElementById("newScan");
    if (newScan) {
        newScan.addEventListener("click", () => {
            window.location.href = "scanner.html";
        });
    }

    const printReport = document.getElementById("printReport");
    if (printReport) {
        printReport.addEventListener("click", () => window.print());
    }

    /* -----------------------------------------------
       NOTIFICATIONS
    ----------------------------------------------- */

    const notification = document.querySelector(".notification");
    if (notification) {
        notification.addEventListener("click", () => {
            alert("No new system alerts. All AI services are operational.");
        });
    }

});
