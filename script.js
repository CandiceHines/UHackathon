document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    let selectedFile = null;
    const uploadBtn = document.getElementById('uploadBtn');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    const processBtn = document.getElementById('processBtn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('resultsContainer');
    const detectedSign = document.getElementById('detectedSign');
    const confidence = document.getElementById('confidence');
    const robotCommand = document.getElementById('robotCommand');
    const executeBtn = document.getElementById('executeBtn');
    const robotAction = document.getElementById('robotAction');
    const robotIndicator = document.getElementById('robotIndicator');
    const lightBulb = document.getElementById('lightBulb');
    const door = document.getElementById('door');
    const commandInput = document.getElementById('commandInput');
    const sendTextBtn = document.getElementById('sendTextBtn');
    const helpBtn = document.getElementById('helpBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Accessibility: Add ARIA labels and roles
    uploadArea.setAttribute('role', 'button');
    uploadArea.setAttribute('aria-label', 'Upload ASL gesture or video');
    uploadArea.setAttribute('tabindex', '0');
    
    processBtn.setAttribute('aria-label', 'Process and interpret the sign language gesture');
    executeBtn.setAttribute('aria-label', 'Execute the recognized command');
    sendTextBtn.setAttribute('aria-label', 'Send text command');

    // Event Listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });


    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    processBtn.addEventListener('click', processGesture);
    executeBtn.addEventListener('click', executeCommand);
    sendTextBtn.addEventListener('click', handleTextCommand);
    helpBtn.addEventListener('click', showHelp);

    // Drag and Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File Handling
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        selectedFile = file;  // 
    
        const fileType = file.type.split('/')[0];
        
        if (fileType === 'image' || fileType === 'video') {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                if (fileType === 'image') {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                    previewVideo.style.display = 'none';
                } else {
                    previewVideo.src = e.target.result;
                    previewVideo.style.display = 'block';
                    previewImage.style.display = 'none';
                }
                previewContainer.style.display = 'block';
                processBtn.focus();
            };
            
            reader.readAsDataURL(file);
        } else {
            showNotification('Please upload an image or video file', 'error');
        }
    }
    

    // Process Gesture
    function processGesture() {
        if (!selectedFile) {
            showNotification("Please upload an image first.", "error");
            return;
        }
    
        loader.style.display = 'block';
        processBtn.disabled = true;
        processBtn.setAttribute('aria-busy', 'true');
    
        const reader = new FileReader();
        reader.onload = function () {
            const AZURE_ENDPOINT = "https://aslclassifierhackathon-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/c8c0d0e7-6c14-404e-a0b5-ddec872274f1/classify/iterations/Iteration1/image";
            const SUBSCRIPTION_KEY = "JmJ9xzhQKWlYCoffPQn7dBYgfuxcK3EE5OJAOsYqdsI9Qqqj4qBJJQQJ99BEAC8vTInXJ3w3AAAIACOGqyY6";
    
            fetch(AZURE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Prediction-Key': SUBSCRIPTION_KEY
                },
                body: reader.result
            })
            .then(response => {

                if (!response.ok) {
                    throw new Error(`Azure response error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loader.style.display = 'none';
                processBtn.disabled = false;
                processBtn.setAttribute('aria-busy', 'false');
    
                const predictions = data.predictions || [];
                console.log(predictions)
    
                if (predictions.length === 0) {
                    showNotification("No predictions returned from Azure.", "error");
                    return;
                }
    
                const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
    
                const results = {
                    sign: best.tagName,
                    confidence: `${(best.probability * 100).toFixed(2)}%`,
                    command: best.tagName.toUpperCase().replace(/\s+/g, '_')
                };
    
                displayResults(results);
            })
            .catch(err => {
                loader.style.display = 'none';
                processBtn.disabled = false;
                processBtn.setAttribute('aria-busy', 'false');
                showNotification("Failed to analyze image with Azure.", "error");
                console.error("Azure error:", err);
            });
        };
    
        reader.readAsArrayBuffer(selectedFile);
    }
    

    

    // Display Results
    function displayResults(results) {
        detectedSign.textContent = results.sign;
        confidence.textContent = results.confidence;
        robotCommand.textContent = results.command;
        resultsContainer.style.display = 'block';
        executeBtn.focus();
    }

    // Execute Command
    function executeCommand() {
        const command = robotCommand.textContent;
        robotAction.textContent = 'Processing your command...';
        robotAction.style.display = 'block';
        
        // Simulate robot action
        setTimeout(() => {
            switch(command) {
                case 'ACTIVATE_LIGHTS':
                    lightBulb.classList.add('active');
                    robotAction.textContent = 'Lights turned on';
                    break;
                case 'DEACTIVATE_LIGHTS':
                    lightBulb.classList.remove('active');
                    robotAction.textContent = 'Lights turned off';
                    break;
                case 'OPEN_DOOR':
                    door.classList.add('open');
                    robotAction.textContent = 'Door opened';
                    break;
                case 'CLOSE_DOOR':
                    door.classList.remove('open');
                    robotAction.textContent = 'Door closed';
                    break;
                default:
                    robotAction.textContent = 'Command executed';
            }
            
            robotIndicator.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                robotAction.style.display = 'none';
                robotIndicator.style.backgroundColor = '';
            }, 3000);
        }, 1000);
    }

    // Handle Text Command
    function handleTextCommand() {
        const text = commandInput.value.trim();
        if (!text) {
            showNotification('Please enter a command', 'error');
            return;
        }

        loader.style.display = 'block';
        sendTextBtn.disabled = true;
        sendTextBtn.setAttribute('aria-busy', 'true');

        // Simulate text command processing
        setTimeout(() => {
            loader.style.display = 'none';
            sendTextBtn.disabled = false;
            sendTextBtn.setAttribute('aria-busy', 'false');
            
            const mockResults = {
                sign: text,
                confidence: '100%',
                command: text.toUpperCase().replace(/\s+/g, '_')
            };
            
            displayResults(mockResults);
            executeCommand();
        }, 1000);
    }

    // Show Help
    function showHelp() {
        const helpContent = `
            <h2>How to Use ASL Robot Assistant</h2>
            <ol>
                <li>Sign each letter of your word (for example, A, B, C) in front of the camera or upload a video/image of your signing.</li>
                <li>Click "Interpret Sign" to instantly convert your ASL signs to written words.</li>
                <li>See the recognized letters and words appear on the screen—fast, easy, and accessible!</li>
            </ol>
            <p>Why use this?</p>
            <ul>
                <li>Instant translation from signs to words</li>
                <li>Spell out any word by signing each letter</li>
                <li>Accessible and easy for everyone</li>
            </ul>
            <p><strong>Example:</strong> To spell "CAB", sign the letters C, A, and B in sequence. The assistant will recognize and display the word "CAB" instantly.</p>
        `;
        
        showNotification(helpContent, 'info', true);
    }

    // Notification System
    function showNotification(message, type = 'info', isHTML = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        
        if (isHTML) {
            notification.innerHTML = message;
        } else {
            notification.textContent = message;
        }
        
        document.body.appendChild(notification);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.className = 'notification-close';
        closeBtn.setAttribute('aria-label', 'Close notification');
        notification.appendChild(closeBtn);
        
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 2rem 2.5rem;
            border-radius: 1rem;
            background: #fff;
            box-shadow: 0 8px 32px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.10);
            z-index: 1000;
            max-width: 480px;
            min-width: 320px;
            font-size: 1.15rem;
            line-height: 1.7;
            border: 1.5px solid var(--primary-color);
            color: var(--text-color);
        }
        .notification h2 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
            font-weight: 700;
        }
        .notification ol, .notification ul {
            margin-left: 1.2rem;
            margin-bottom: 1rem;
        }
        .notification li {
            margin-bottom: 0.5rem;
        }
        .notification p {
            margin-bottom: 0.7rem;
        }
        .notification strong {
            color: var(--primary-color);
        }
        .notification a {
            color: var(--primary-hover);
            text-decoration: underline;
        }
        .notification-close {
            position: absolute;
            top: 0.7rem;
            right: 0.7rem;
            background: none;
            border: none;
            font-size: 1.7rem;
            cursor: pointer;
            padding: 0.25rem;
            line-height: 1;
            color: var(--light-text);
            transition: color 0.2s ease;
        }
        .notification-close:hover {
            color: var(--primary-color);
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .dragover {
            border-color: var(--primary-color);
            background-color: var(--secondary-color);
        }
    `;
    document.head.appendChild(style);

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        html.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = html.getAttribute('data-theme') === 'dark';
            if (isDark) {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.textContent = '🌙';
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.textContent = '☀️';
            }
        });
    }
}); 