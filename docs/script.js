document.addEventListener("DOMContentLoaded", () => {
    const historySelect = document.getElementById("history-select");

    // Load initial data for Today's Brief
    loadBriefData("./data/daily_brief.json");

    // Fetch archive manifest and populate dropdown options
    fetch("./data/manifest.json")
        .then(response => response.ok ? response.json() : [])
        .then(dates => {
            const sortedDates = dates.sort().reverse();
            const pastDates = sortedDates.slice(1);
            if (pastDates.length > 0) {
                pastDates.forEach(date => {
                    const option = document.createElement("option");
                    option.value = `./data/archive/brief_${date}.json`;
                    option.textContent = date; 
                    historySelect.appendChild(option);
                });
            }
        });

    // Re-render all sections when switching dates
    historySelect.addEventListener("change", (event) => {
        const selectedPath = event.target.value === "latest" ? "./data/daily_brief.json" : event.target.value;
        loadBriefData(selectedPath);
    });
});

function loadBriefData(path) {
    fetch(path)
        .then(response => response.ok ? response.json() : null)
        .then(data => {
            if (!data) return;

            // Update Metadata Date Header
            document.getElementById("meta").textContent = `Updated on ${data.date || 'Today'}`;

            // 1. Render Top Stories
            const storiesContainer = document.getElementById("stories");
            storiesContainer.innerHTML = "";
            if (data.top_stories && data.top_stories.length > 0) {
                data.top_stories.forEach(story => {
                    const card = document.createElement("div");
                    card.className = "story";
                    card.innerHTML = `
                        <h2>${story.rank}. ${story.title}</h2>
                        <div class="story-content">
                            <p>${story.summary}</p>
                            <div class="tech-details">
                                <p><strong>💡 Technical Takeaway:</strong> ${story.technical_takeaway}</p>
                                <p><strong style="color: #c0392b;">⚖️ Risk:</strong> ${story.primary_risk}</p>
                                <p><strong style="color: #27ae60;">🚀 Opportunity:</strong> ${story.primary_opportunity}</p>
                            </div>
                            <p class="source">Source: <a href="${story.url}" target="_blank">${story.source}</a></p>
                        </div>
                    `;
                    storiesContainer.appendChild(card);
                });
            }

            // 2. Render Jargon Decoder
            renderJargon(data.jargon || data.jargon_terms || data);

            // 3. Render AI Dev Toolbox
            renderToolbox(data.toolbox || data.tools || data);

            // 4. Render Lab Report
            renderLabReport(data.lab_report || data.papers || data);
        });
}

function renderJargon(termsData) {
    const section = document.getElementById("jargon-decoder");
    const container = document.getElementById("jargon-container");
    container.innerHTML = "";

    const terms = Array.isArray(termsData) ? termsData : (termsData?.terms || []);

    if (terms.length > 0) {
        section.style.display = "block";
        const titleElement = section.querySelector(".section-title");
        if (titleElement) {
            titleElement.innerHTML = `🎓 Jargon Decoder <span class="update-tag">${termsData.last_updated || ''}</span>`;
        }
        
        terms.forEach(item => {
            const box = document.createElement("div");
            box.className = "jargon-card";
            box.innerHTML = `
                <h4>${item.term}</h4>
                <p class="jargon-def">${item.definition}</p>
                <div class="jargon-meta-box">
                    <p class="jargon-analogy"><strong>💡 Analogy:</strong> ${item.analogy}</p>
                    <p class="jargon-biz"><strong>📊 Business Value:</strong> ${item.business_value}</p>
                </div>
            `;
            container.appendChild(box);
        });
    } else {
        section.style.display = "none";
    }
}

function renderToolbox(toolsData) {
    const section = document.getElementById("ai-toolbox");
    const container = document.getElementById("toolbox-container");
    container.innerHTML = "";

    const tools = Array.isArray(toolsData) ? toolsData : (toolsData?.tools || []);

    if (tools.length > 0) {
        section.style.display = "block";
        tools.forEach(tool => {
            const card = document.createElement("div");
            card.className = "tool-card";
            card.innerHTML = `
                <div class="tool-header">
                    <span class="category-pill">${tool.Category || tool.category}</span>
                    <h4>${tool.Name || tool.name}</h4>
                </div>
                <p class="tool-desc">${tool.Description || tool.description}</p>
                <p class="tool-usage"><strong>Use Case:</strong> ${tool.Use_Case || tool.use_case}</p>
                <a href="${tool.URL || tool.url}" target="_blank" class="tool-link">View Repository →</a>
            `;
            container.appendChild(card);
        });
    } else {
        section.style.display = "none";
    }
}

function renderLabReport(labData) {
    const section = document.getElementById("lab-report");
    const container = document.getElementById("lab-container");
    container.innerHTML = "";

    const papers = Array.isArray(labData) ? labData : (labData?.papers || []);

    if (papers.length > 0) {
        section.style.display = "block";
        papers.forEach(paper => {
            const card = document.createElement("div");
            card.className = "lab-card";
            card.innerHTML = `
                <h4>${paper.title}</h4>
                <div class="lab-meta">
                    <p><strong>Innovation:</strong> ${paper.innovation}</p>
                    <p><strong>Use Case:</strong> ${paper.use_case}</p>
                </div>
                <a href="${paper.url}" target="_blank" class="lab-link">Read Full Paper →</a>
            `;
            container.appendChild(card);
        });
    } else {
        section.style.display = "none";
    }
}