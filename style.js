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

        const scoreDescription = document.getElementById("scoreDescription");
        const stored = localStorage.getItem("complianceReport");

        if (!stored) {
            if (scoreDescription) {
                scoreDescription.textContent =
                    "No scan data found. Start a new inspection from the AI Scanner.";
            }
        } else {
            try {
                renderReport(JSON.parse(stored));
            } catch (error) {
                if (scoreDescription) {
                    scoreDescription.textContent =
                        "Could not read the saved report. Please run a new scan.";
                }
            }
        }
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        const text = (value === undefined || value === null || value === "") ? "—" : String(value);
        element.textContent = text;
    }

    function has(value) {
        return value !== undefined && value !== null && String(value).trim() !== "";
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? "" : value).replace(/[&<>"']/g, s => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[s]));
    }

    function formatCurrency(value) {
        if (!has(value)) return "";
        return "₹" + value;
    }

    /* Builds the pass/review/fail list. Expiry is ALWAYS a review
       item (never a plain pass) since date OCR needs a human check. */
    function buildChecks(product) {

        const checks = [
            { label: "Product Name", note: "Commodity name detected", pass: has(product.product_name) },
            { label: "MRP Declaration", note: "Maximum Retail Price detected", pass: has(product.mrp) },
            { label: "Net Quantity", note: "Quantity declaration detected", pass: has(product.net_quantity) },
            { label: "Manufacturer", note: "Manufacturer details detected", pass: has(product.manufacturer) },
            { label: "Consumer Care", note: "Contact information detected", pass: has(product.consumer_care) },
            { label: "Country of Origin", note: "Country declaration detected", pass: has(product.country_of_origin) },
            { label: "Manufacturing Date", note: "Date of manufacture detected", pass: has(product.manufacturing_date) }
        ].map(c => ({ label: c.label, note: c.note, status: c.pass ? "passed" : "failed" }));

        const expiryPresent = has(product.expiry_date);
        checks.push({
            label: "Expiry Information",
            note: expiryPresent
                ? "Detected — confirm the date manually before approval"
                : "Expiry declaration not detected",
            status: expiryPresent ? "warning" : "failed"
        });

        return checks;
    }

    function renderChecks(checks) {
        const grid = document.getElementById("checksGrid");
        if (!grid) return;

        grid.innerHTML = checks.map(check => {
            const icon = check.status === "passed" ? "✓" : check.status === "warning" ? "!" : "✕";
            const tag = check.status === "passed" ? "PASS" : check.status === "warning" ? "REVIEW" : "FAIL";
            return (
                '<div class="check-item ' + check.status + '">' +
                    '<div class="check-icon">' + icon + '</div>' +
                    '<div>' +
                        '<strong>' + escapeHtml(check.label) + '</strong>' +
                        '<small>' + escapeHtml(check.note) + '</small>' +
                    '</div>' +
                    '<span>' + tag + '</span>' +
                '</div>'
            );
        }).join("");
    }

    function renderChecksCount(passed, total) {
        const strong = document.querySelector("#checksCount strong");
        if (strong) strong.textContent = passed + " / " + total;
    }

    function renderRisks(checks) {
        const list = document.getElementById("riskList");
        if (!list) return;

        const issues = checks.filter(c => c.status !== "passed");

        if (issues.length === 0) {
            list.innerHTML = '<p class="score-description" style="margin-top:20px;">' +
                'No issues detected. All mandatory declarations are present.</p>';
            return;
        }

        list.innerHTML = issues.map((issue, index) => {
            const severity = issue.status === "failed" ? "risk-high" : "risk-medium";
            const tag = issue.status === "failed" ? "HIGH" : "MEDIUM";
            const verb = issue.status === "failed" ? "missing" : "requires manual review";
            return (
                '<div class="risk-item">' +
                    '<div class="risk-number">' + String(index + 1).padStart(2, "0") + '</div>' +
                    '<div>' +
                        '<strong>' + escapeHtml(issue.label) + ' ' + verb + '</strong>' +
                        '<p>' + escapeHtml(issue.note) + '</p>' +
                    '</div>' +
                    '<span class="' + severity + '">' + tag + '</span>' +
                '</div>'
            );
        }).join("");
    }

    function renderReport(data) {

        const product = data.product || {};

        /* top summary */
        setText("productName", product.product_name);
        setText("productCategory", [product.brand, product.category].filter(Boolean).join(" · "));
        setText("mrp", formatCurrency(product.mrp));
        setText("quantity", product.net_quantity);
        setText("manufacturer", product.manufacturer);
        setText("inspectionId", data.inspectionId);
        setText("matchBarcode", product.barcode || data.barcode);

        /* full label details */
        setText("barcode", product.barcode || data.barcode);
        setText("brand", product.brand);
        setText("batchNumber", product.batch_number);
        setText("fssai", product.fssai_license);
        setText("mfgDate", product.manufacturing_date);
        setText("expiryDateField", product.expiry_date);
        setText("countryOfOrigin", product.country_of_origin);
        setText("consumerCareDetail", product.consumer_care);
        setText("manufacturerAddress", product.manufacturer_address);
        setText("ingredients", product.ingredients);
        setText("nutritionInfo", product.nutrition_info);

        /* product image */
        const resultImage = document.getElementById("resultProductImage");
        if (resultImage && data.image) {
            const img = document.createElement("img");
            img.src = data.image;
            img.alt = "Scanned product";
            resultImage.innerHTML = "";
            resultImage.appendChild(img);
        }

        /* checks + score */
        const checks = buildChecks(product);
        renderChecks(checks);
        renderChecksCount(
            checks.filter(c => c.status === "passed").length,
            checks.length
        );
        renderRisks(checks);

        const passedCount = checks.filter(c => c.status === "passed").length;
        const failedCount = checks.filter(c => c.status === "failed").length;
        const reviewCount = checks.filter(c => c.status === "warning").length;
        const score = Math.round((passedCount / checks.length) * 100);
        const isCompliant = failedCount === 0;

        setText("resultScore", score + "%");

        const resultCircle = document.getElementById("resultCircle");
        if (resultCircle) {
            const degrees = score * 3.6;
            const color = isCompliant ? "#22c55e" : "#ef4444";
            resultCircle.style.background =
                "conic-gradient(" + color + " 0deg " + degrees + "deg, #202938 " + degrees + "deg 360deg)";
        }

        const resultStatus = document.getElementById("resultStatus");
        if (resultStatus) {
            resultStatus.classList.remove("success", "danger");
            if (isCompliant) {
                resultStatus.classList.add("success");
                resultStatus.innerHTML = "<span>✓</span> COMPLIANT";
            } else {
                resultStatus.classList.add("danger");
                resultStatus.innerHTML = "<span>!</span> NON-COMPLIANT";
            }
        }

        const scoreDescription = document.getElementById("scoreDescription");
        if (scoreDescription) {
            if (isCompliant) {
                scoreDescription.textContent = passedCount + " of " + checks.length +
                    " mandatory declarations detected." +
                    (reviewCount ? " " + reviewCount + " item needs manual review." : "");
            } else {
                scoreDescription.textContent = failedCount +
                    " mandatory declaration" + (failedCount === 1 ? "" : "s") +
                    " missing. Correction required before approval.";
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
