document.addEventListener("DOMContentLoaded", () => {
    const historySelect = document.getElementById("history-select");

    // Load initial today's data
    loadAllDefaultData();

    // Load history manifest
    fetch("data/manifest.json")
        .then(response => response.ok ? response.json() : [])
        .then(dates => {
            const sortedDates = dates.sort().reverse();
            const pastDates = sortedDates.slice(1);
            if (pastDates.length > 0) {
                pastDates.forEach(date => {
                    const option = document.createElement("option");
                    option.value = `data/archive/brief_${date}.json`;
                    option.textContent = date; 
                    historySelect.appendChild(option);
                });
            }
        })
        .catch(err => console.error("Error loading manifest:", err));

    // Handle dropdown selection change
    historySelect.addEventListener("change", (event) => {
        if (event.target.value === "latest") {
            loadAllDefaultData();
        } else {
            loadArchivedBrief(event.target.value);
        }
    });
});

function loadAllDefaultData() {
    loadBriefData("data/daily_brief.json");
    loadJargonData("data/jargon_buster.json");
    loadLabData("data/lab_report.json");
    loadToolboxData("data/toolbox.json");
}

function loadBriefData(path) {
    fetch(path)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            document.getElementById("meta").textContent = `Updated on ${data.date || 'Today'}`;
            const container = document.getElementById("stories");
            container.innerHTML = "";
            
            const stories = data.top_stories || [];
            stories.forEach(story => {
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
                container.appendChild(card);
            });
        })
        .catch(err => console.error("Error loading stories:", err));
}

function loadJargonData(path) {
    fetch(path)
        .then(res => res.ok ? res.json() : null)
        .then(data => renderJargon(data))
        .catch(() => renderJargon(null));
}

function loadToolboxData(path) {
    fetch(path)
        .then(res => res.ok ? res.json() : null)
        .then(data => renderToolbox(data))
        .catch(() => renderToolbox(null));
}

function loadLabData(path) {
    fetch(path)
        .then(res => res.ok ? res.json() : null)
        .then(data => renderLabReport(data))
        .catch(() => renderLabReport(null));
}

function loadArchivedBrief(archivePath) {
    fetch(archivePath)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            document.getElementById("meta").textContent = `Updated on ${data.date || 'Today'}`;
            
            // Stories
            const container = document.getElementById("stories");
            container.innerHTML = "";
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
                    container.appendChild(card);
                });
            }

            // Optional archival sections
            renderJargon(data.jargon || data.jargon_terms || null);
            renderToolbox(data.toolbox || data.tools || null);
            renderLabReport(data.lab_report || data.papers || null);
        });
}

function renderJargon(data) {
    const section = document.getElementById("jargon-decoder");
    const container = document.getElementById("jargon-container");
    const terms = data?.terms || (Array.isArray(data) ? data : []);

    if (terms.length > 0) {
        section.style.display = "block";
        const titleElement = section.querySelector(".section-title");
        if (titleElement) {
            titleElement.innerHTML = `🎓 Jargon Decoder <span class="update-tag">${data.last_updated || ''}</span>`;
        }
        container.innerHTML = "";
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

function renderToolbox(data) {
    const section = document.getElementById("ai-toolbox");
    const container = document.getElementById("toolbox-container");
    const tools = data?.tools || (Array.isArray(data) ? data : []);

    if (tools.length > 0) {
        section.style.display = "block";
        container.innerHTML = "";
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

function renderLabReport(data) {
    const section = document.getElementById("lab-report");
    const container = document.getElementById("lab-container");
    const papers = data?.papers || (Array.isArray(data) ? data : []);

    if (papers.length > 0) {
        section.style.display = "block";
        container.innerHTML = "";
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