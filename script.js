const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const sentimentResult = document.getElementById("sentimentResult");
const resultMessage = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const confidenceValue = document.getElementById("confidenceValue");
const progressBar = document.getElementById("progressBar");

const positiveScore = document.getElementById("positiveScore");
const neutralScore = document.getElementById("neutralScore");
const negativeScore = document.getElementById("negativeScore");

const totalAnalyzed = document.getElementById("totalAnalyzed");
const positiveCount = document.getElementById("positiveCount");
const neutralCount = document.getElementById("neutralCount");
const negativeCount = document.getElementById("negativeCount");

const historyList = document.getElementById("historyList");
const clearHistory = document.getElementById("clearHistory");

let statistics = {
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0
};

let history = [];

const positiveWords = [
    "good", "great", "excellent", "amazing", "awesome",
    "love", "lovely", "happy", "wonderful", "fantastic",
    "best", "beautiful", "perfect", "success", "successful",
    "enjoy", "enjoyed", "nice", "positive", "brilliant",
    "excited", "helpful", "thank", "thanks", "win", "winning"
];

const negativeWords = [
    "bad", "worst", "terrible", "awful", "hate",
    "sad", "angry", "poor", "horrible", "disappointed",
    "disappointing", "fail", "failure", "problem",
    "wrong", "boring", "annoying", "negative", "useless",
    "difficult", "scam", "delay", "slow", "broken"
];

textInput.addEventListener("input", () => {
    const length = textInput.value.length;
    charCount.textContent = `${length} characters`;
});

clearBtn.addEventListener("click", () => {
    textInput.value = "";
    charCount.textContent = "0 characters";
    resetResult();
});

analyzeBtn.addEventListener("click", analyzeSentiment);

function analyzeSentiment() {

    const text = textInput.value.trim();

    if (!text) {
        alert("Please enter some text to analyze.");
        return;
    }

    analyzeBtn.textContent = "Analyzing...";
    analyzeBtn.disabled = true;

    setTimeout(() => {

        const result = calculateSentiment(text);

        displayResult(result);
        updateStatistics(result.sentiment);
        addHistory(text, result);

        analyzeBtn.textContent = "✨ Analyze Sentiment";
        analyzeBtn.disabled = false;

    }, 600);
}

function calculateSentiment(text) {

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);

    let positive = 0;
    let negative = 0;

    words.forEach(word => {

        if (positiveWords.includes(word)) {
            positive++;
        }

        if (negativeWords.includes(word)) {
            negative++;
        }
    });

    let sentiment;
    let confidence;

    if (positive > negative) {
        sentiment = "Positive";
        confidence = calculateConfidence(positive, negative);
    } else if (negative > positive) {
        sentiment = "Negative";
        confidence = calculateConfidence(negative, positive);
    } else {
        sentiment = "Neutral";
        confidence = 65;
    }

    const total = positive + negative;

    let positivePercentage = 0;
    let negativePercentage = 0;
    let neutralPercentage = 0;

    if (total > 0) {
        positivePercentage = Math.round((positive / total) * 100);
        negativePercentage = Math.round((negative / total) * 100);
    } else {
        neutralPercentage = 100;
    }

    if (sentiment === "Neutral") {
        positivePercentage = 0;
        negativePercentage = 0;
        neutralPercentage = 100;
    }

    return {
        sentiment,
        confidence,
        positivePercentage,
        negativePercentage,
        neutralPercentage
    };
}

function calculateConfidence(mainScore, otherScore) {

    const difference = mainScore - otherScore;

    return Math.min(
        98,
        Math.max(70, 70 + difference * 8)
    );
}

function displayResult(result) {

    sentimentResult.textContent = result.sentiment;

    confidenceValue.textContent = `${result.confidence}%`;
    progressBar.style.width = `${result.confidence}%`;

    positiveScore.textContent = `${result.positivePercentage}%`;
    neutralScore.textContent = `${result.neutralPercentage}%`;
    negativeScore.textContent = `${result.negativePercentage}%`;

    if (result.sentiment === "Positive") {

        resultIcon.textContent = "😊";
        resultMessage.textContent =
            "The text expresses a positive opinion or emotion.";

    } else if (result.sentiment === "Negative") {

        resultIcon.textContent = "😡";
        resultMessage.textContent =
            "The text expresses a negative opinion or emotion.";

    } else {

        resultIcon.textContent = "😐";
        resultMessage.textContent =
            "The text appears neutral or contains balanced emotions.";
    }

    document.getElementById("status").textContent = "Analyzed";
}

function updateStatistics(sentiment) {

    statistics.total++;

    if (sentiment === "Positive") {
        statistics.positive++;
    } else if (sentiment === "Negative") {
        statistics.negative++;
    } else {
        statistics.neutral++;
    }

    totalAnalyzed.textContent = statistics.total;
    positiveCount.textContent = statistics.positive;
    neutralCount.textContent = statistics.neutral;
    negativeCount.textContent = statistics.negative;
}

function addHistory(text, result) {

    history.unshift({
        text: text,
        sentiment: result.sentiment,
        confidence: result.confidence,
        time: new Date().toLocaleTimeString()
    });

    if (history.length > 8) {
        history.pop();
    }

    renderHistory();
}

function renderHistory() {

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty">No analysis performed yet.</p>';
        return;
    }

    historyList.innerHTML = "";

    history.forEach(item => {

        let emoji = "😐";

        if (item.sentiment === "Positive") {
            emoji = "😊";
        }

        if (item.sentiment === "Negative") {
            emoji = "😡";
        }

        const div = document.createElement("div");

        div.className = "history-item";

        div.innerHTML = `
            <div class="history-emoji">${emoji}</div>

            <div class="history-text">
                <strong>${item.sentiment}</strong>
                <small>${escapeHTML(item.text)}</small>
            </div>

            <div>
                <strong>${item.confidence}%</strong>
                <small>${item.time}</small>
            </div>
        `;

        historyList.appendChild(div);
    });
}

clearHistory.addEventListener("click", () => {

    history = [];

    statistics = {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0
    };

    totalAnalyzed.textContent = "0";
    positiveCount.textContent = "0";
    neutralCount.textContent = "0";
    negativeCount.textContent = "0";

    renderHistory();
});

function resetResult() {

    sentimentResult.textContent = "Waiting for text";
    resultMessage.textContent =
        "Enter some text and click Analyze Sentiment.";

    resultIcon.textContent = "😊";

    confidenceValue.textContent = "0%";
    progressBar.style.width = "0%";

    positiveScore.textContent = "0%";
    neutralScore.textContent = "0%";
    negativeScore.textContent = "0%";

    document.getElementById("status").textContent = "Ready";
}

function escapeHTML(text) {

    const div = document.createElement("div");
    div.textContent = text;

    return div.innerHTML;
}