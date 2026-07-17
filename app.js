let regData = null;

/* =========================
   HELPER: Convert file → Base64
========================= */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       AGENCY TOGGLE
    ========================= */
    const agencySelect = document.getElementById("agency");
    const otherAgencyInput = document.getElementById("otherAgency");

    if (agencySelect && otherAgencyInput) {

        agencySelect.addEventListener("change", function () {

            if (this.value === "Others") {
                otherAgencyInput.style.display = "block";
                otherAgencyInput.required = true;
                otherAgencyInput.focus();
            } else {
                otherAgencyInput.style.display = "none";
                otherAgencyInput.required = false;
                otherAgencyInput.value = "";
            }

        });

    }

    /* =========================
       PAYMENT PROOF TOGGLE
    ========================= */
   /* const paymentDone = document.getElementById("paymentDone");
    const paymentProofBox = document.getElementById("paymentProofBox");
    const paymentProof = document.getElementById("paymentProof");

    if (paymentDone && paymentProofBox && paymentProof) {

        paymentDone.addEventListener("change", function () {

            if (this.value === "Yes") {
                paymentProofBox.style.display = "block";
                paymentProof.required = true;
            } else {
                paymentProofBox.style.display = "none";
                paymentProof.required = false;
                paymentProof.value = "";
            }

        });

    }*/

});


/* =========================
   FORM SUBMIT
========================= */
document.getElementById("registrationForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.innerText = "Registering...";

    try {

        const agencyValue = document.getElementById("agency").value;
        const otherAgencyValue = document.getElementById("otherAgency").value;

        const paymentDoneValue = document.getElementById("paymentDone").value;
        const paymentProofInput = document.getElementById("paymentProof");

        /* =========================
           FORM DATA
        ========================= */
        const formData = new FormData();

        formData.append("name", document.getElementById("name").value);
        formData.append("staffId", document.getElementById("staffId").value);
        formData.append("position", document.getElementById("position").value);
        formData.append("gender", document.getElementById("gender").value);
        formData.append("rank", document.getElementById("rank").value);
        formData.append("region", document.getElementById("region").value);
        formData.append("district", document.getElementById("district").value);
        formData.append("facility", document.getElementById("facility").value);
        formData.append("phone", document.getElementById("phone").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("emergencyContact", document.getElementById("emergencyContact").value);

        formData.append(
            "agency",
            agencyValue === "Others" ? otherAgencyValue : agencyValue
        );

        formData.append("participation", document.getElementById("participation").value);
        formData.append("tshirtColor", document.getElementById("tshirtColor").value);
        formData.append("tshirtSize", document.getElementById("tshirtSize").value);
        formData.append("paymentDone", paymentDoneValue);
        formData.append("paymentModel", document.getElementById("paymentModel").value);

        /* =========================
           PAYMENT PROOF (BASE64 FIX)
        ========================= */
       /* if (paymentDoneValue === "Yes" && paymentProofInput?.files.length > 0) {

            const base64File = await fileToBase64(paymentProofInput.files[0]);

            formData.append("paymentProof", base64File);
            formData.append("fileName", paymentProofInput.files[0].name);
        }*/

        /* =========================
           SEND TO GOOGLE SCRIPT
        ========================= */
        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbxZ_USz_Uq-dYpV4dhhDW8MxjHox1yUz-j337O_3f-OsAiJ9d6i3Nn6S-Gpz6thxeyitQ/exec",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!result || result.status !== "success") {
            throw new Error(result?.message || "Registration failed");
        }

        regData = result;

        /* =========================
           SUCCESS MODAL
        ========================= */
        document.getElementById("successText").innerText = result.regCode;

        document.getElementById("s_name").innerText =
            document.getElementById("name").value;

        document.getElementById("s_rank").innerText =
            document.getElementById("rank").value;

        document.getElementById("s_region").innerText =
            document.getElementById("region").value;

        document.getElementById("s_facility").innerText =
            document.getElementById("facility").value;

        document.getElementById("successModal").style.display = "flex";

        document.getElementById("registrationForm").reset();

        const paymentProofBox = document.getElementById("paymentProofBox");
        if (paymentProofBox) paymentProofBox.style.display = "none";

    } catch (err) {

        document.getElementById("result").innerHTML = `
            <div class="alert alert-danger">
                ${err.message}
            </div>
        `;

        console.error("ERROR:", err);

    } finally {
        btn.disabled = false;
        btn.innerText = "Register";
    }

});


/* =========================
   DOWNLOAD REGISTRATION PDF
========================= */
async function downloadSlip() {

    if (!regData) {
        alert("No registration data found.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // Colors
    const blue = [11,74,139];
    const green = [0,120,60];

    // Header
    doc.setFillColor(...green);
    doc.rect(0,0,210,18,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(18);
    doc.text("GHANA HEALTH SERVICE",105,11,{align:"center"});

    doc.setTextColor(...blue);
    doc.setFontSize(15);
    doc.text("2026 Senior Nursing & Midwifery Managers Conference",105,28,{align:"center"});

    doc.setDrawColor(0,120,60);
    doc.line(20,32,190,32);

    // Registration Code
    doc.setFontSize(14);
    doc.setFont("helvetica","bold");
    doc.text("Registration Code",20,45);

    doc.setTextColor(200,0,0);
    doc.setFontSize(18);
    doc.text(regData.regCode,20,53);

    doc.setTextColor(0,0,0);

    // Status
    doc.setFontSize(12);
    doc.text("Status:",150,45);
    doc.setTextColor(0,120,60);
    doc.text(regData.statusText || "Registered",170,45);

    doc.setTextColor(0,0,0);

    let y = 65;

    function row(label,value){

        doc.setFont("helvetica","bold");
        doc.text(label,20,y);

        doc.setFont("helvetica","normal");
        doc.text(String(value || "-"),70,y);

        y += 9;

    }

    row("Full Name",regData.name);
    row("Staff ID",regData.staffId);
    row("Position",regData.position);
    row("Rank",regData.rank);
    row("Gender",regData.gender);
    row("Phone",regData.phone);
    row("Email",regData.email);
    row("Region",regData.region);
    row("District",regData.district);
    row("Facility",regData.facility);
    row("Agency",regData.agency);
    row("Participation",regData.participation);
    row("T-Shirt Colour",regData.tshirtColor);
    row("T-Shirt Size",regData.tshirtSize);
    row("Payment",regData.paymentDone);
    row("Payment Model",regData.paymentModel);

    // QR Code
    if(regData.qr){

        try{

            const img=await fetch(regData.qr)
            .then(r=>r.blob())
            .then(blob=>new Promise(resolve=>{
                const reader=new FileReader();
                reader.onloadend=()=>resolve(reader.result);
                reader.readAsDataURL(blob);
            }));

            doc.addImage(img,"PNG",145,70,45,45);

        }catch(e){
            console.log("QR skipped");
        }

    }

    y += 10;

    doc.setFillColor(240,248,240);
    doc.rect(15,y,180,45,"F");

    doc.setFont("helvetica","bold");
    doc.setTextColor(...blue);
    doc.text("Conference Information",20,y+8);

    doc.setFont("helvetica","normal");
    doc.setTextColor(0,0,0);

    doc.text("Arrival: Tuesday, 22 September 2026",20,y+18);
    doc.text("Conference: 23 - 25 September 2026",20,y+26);
    doc.text("Departure: Saturday, 26 September 2026",20,y+34);
    doc.text("Venue: Pentecost Convention Centre, Gomoa Fetteh",20,y+42);

    doc.setFontSize(10);
    doc.setTextColor(120);

    doc.text(
        "Please present this registration slip together with your QR Code during conference check-in.",
        105,
        285,
        {align:"center"}
    );

    doc.save(`${regData.regCode}.pdf`);
}

/* =========================
   CLOSE MODAL
========================= */
function closeModal() {
    document.getElementById("successModal").style.display = "none";
}