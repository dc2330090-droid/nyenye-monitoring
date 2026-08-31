// =====================================================
// NYENYE DASHBOARD
// =====================================================

// Quand le frontend est servi par Render,
// on utilise automatiquement la même adresse.

// Exemple:
// https://nyenye-monitoring.onrender.com

const API_URL = "";


// =====================================================
// ELEMENTS
// =====================================================

const rpmElement =
    document.getElementById("rpm");

const rmsElement =
    document.getElementById("rms");

const vrmsElement =
    document.getElementById("vrms");

const irElement =
    document.getElementById("ir");

const irTextElement =
    document.getElementById("irText");

const accelXElement =
    document.getElementById("accelX");

const accelYElement =
    document.getElementById("accelY");

const accelZElement =
    document.getElementById("accelZ");

const motorStateElement =
    document.getElementById("motorState");

const systemStatusElement =
    document.getElementById("systemStatus");

const espStatusElement =
    document.getElementById("espStatus");

const unoStatusElement =
    document.getElementById("unoStatus");

const lastUpdateElement =
    document.getElementById("lastUpdate");


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard(data) {

    rpmElement.textContent =
        Number(data.rpm).toFixed(1);

    rmsElement.textContent =
        Number(data.rms).toFixed(4);

    vrmsElement.textContent =
        Number(data.vrms).toFixed(6);

    accelXElement.textContent =
        Number(data.x).toFixed(3);

    accelYElement.textContent =
        Number(data.y).toFixed(3);

    accelZElement.textContent =
        Number(data.z).toFixed(3);

    irElement.textContent =
        data.ir;

    if (data.ir === 1) {

        irTextElement.textContent =
            "Détection";

    } else {

        irTextElement.textContent =
            "Aucune détection";
    }

    updateMotor(data.relay);

    if (data.last_update) {

        const date =
            new Date(data.last_update);

        lastUpdateElement.textContent =
            date.toLocaleTimeString();
    }

    if (data.uno_online) {

        unoStatusElement.textContent =
            "EN LIGNE";

    } else {

        unoStatusElement.textContent =
            "HORS LIGNE";
    }

    if (data.esp_online) {

        espStatusElement.textContent =
            "EN LIGNE";

    } else {

        espStatusElement.textContent =
            "HORS LIGNE";
    }

    if (
        data.uno_online ||
        data.esp_online
    ) {

        systemStatusElement.textContent =
            "● EN LIGNE";

        systemStatusElement.className =
            "status online";

    } else {

        systemStatusElement.textContent =
            "● HORS LIGNE";

        systemStatusElement.className =
            "status offline";
    }
}


// =====================================================
// MOTEUR
// =====================================================

function updateMotor(state) {

    if (state) {

        motorStateElement.textContent =
            "MARCHE";

        motorStateElement.className =
            "motor-state on";

    } else {

        motorStateElement.textContent =
            "ARRÊT";

        motorStateElement.className =
            "motor-state off";
    }
}


// =====================================================
// MARCHE
// =====================================================

document
    .getElementById("btnOn")
    .addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/motor/on`,
                        {
                            method: "POST"
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "MARCHE:",
                    data
                );

                loadStatus();

            } catch (error) {

                console.error(
                    "Erreur MARCHE:",
                    error
                );
            }
        }
    );


// =====================================================
// ARRET
// =====================================================

document
    .getElementById("btnOff")
    .addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/motor/off`,
                        {
                            method: "POST"
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "ARRET:",
                    data
                );

                loadStatus();

            } catch (error) {

                console.error(
                    "Erreur ARRET:",
                    error
                );
            }
        }
    );


// =====================================================
// STATUS
// =====================================================

async function loadStatus() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/status`
            );

        if (!response.ok) {

            throw new Error(
                "API indisponible"
            );
        }

        const data =
            await response.json();

        updateDashboard(data);

    } catch (error) {

        console.error(error);

        systemStatusElement.textContent =
            "● HORS LIGNE";

        systemStatusElement.className =
            "status offline";
    }
}


// =====================================================
// ACTUALISATION
// =====================================================

setInterval(
    loadStatus,
    2000
);

loadStatus();
